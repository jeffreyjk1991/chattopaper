function send(res,status,body){
  res.statusCode=status;
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store, max-age=0');
  res.end(JSON.stringify(body));
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='POST'){
    res.setHeader('allow','GET, POST');
    return send(res,405,{error:'method_not_allowed'});
  }

  try{
    const url=process.env.PDF_COUNTER_FUNCTION_URL;
    const secret=process.env.PDF_COUNTER_SECRET;
    if(!url||!secret) throw new Error('counter_not_configured');

    let body;
    if(req.method==='POST'){
      const origin=String(req.headers&&req.headers.origin||'');
      if(origin&&origin!=='https://chattopaper.com'&&origin!=='https://www.chattopaper.com'){
        return send(res,403,{error:'forbidden_origin'});
      }
      let input=req.body;
      if(typeof input==='string'){try{input=JSON.parse(input);}catch(_){input={};}}
      const eventId=String(input&&input.eventId||'');
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)){
        return send(res,400,{error:'invalid_event'});
      }
      body=JSON.stringify({eventId});
    }

    const upstream=await fetch(url,{
      method:req.method,
      headers:{
        accept:'application/json',
        'content-type':'application/json',
        'x-counter-secret':secret
      },
      ...(body?{body}:{}),
      cache:'no-store'
    });

    const data=await upstream.json().catch(()=>({}));
    if(!upstream.ok) throw new Error('counter_function_'+upstream.status);
    const count=Number(data&&data.count);
    if(!Number.isFinite(count)) throw new Error('invalid_counter_response');
    return send(res,200,{count});
  }catch(error){
    console.error('pdf-count',error&&error.message?error.message:error);
    return send(res,503,{error:'counter_unavailable'});
  }
};