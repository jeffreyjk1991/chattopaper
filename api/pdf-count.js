const DATA_API='https://ep-cool-bar-b4ppza3t.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1/pdf_generation_events';

function send(res,status,body){
  res.statusCode=status;
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store, max-age=0');
  res.end(JSON.stringify(body));
}

module.exports=async function handler(req,res){
  try{
    if(req.method==='GET'){
      const upstream=await fetch(DATA_API+'?select=event_id&limit=1',{
        headers:{prefer:'count=exact',range:'0-0','range-unit':'items'},
        cache:'no-store'
      });
      if(!upstream.ok && upstream.status!==206) throw new Error('counter read '+upstream.status);
      const contentRange=upstream.headers.get('content-range')||'';
      const match=contentRange.match(/\/(\d+)$/);
      if(!match) throw new Error('counter total missing');
      return send(res,200,{count:Number(match[1])});
    }
    if(req.method==='POST'){
      let body=req.body;
      if(typeof body==='string'){try{body=JSON.parse(body);}catch(_){body={};}}
      const eventId=String(body&&body.eventId||'');
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)) return send(res,400,{error:'invalid_event'});
      const upstream=await fetch(DATA_API,{
        method:'POST',
        headers:{'content-type':'application/json',prefer:'return=minimal'},
        body:JSON.stringify({event_id:eventId}),
        cache:'no-store'
      });
      if(!upstream.ok) throw new Error('counter write '+upstream.status);
      return send(res,200,{ok:true});
    }
    res.setHeader('allow','GET, POST');
    return send(res,405,{error:'method_not_allowed'});
  }catch(error){
    console.error('pdf-count',error&&error.message?error.message:error);
    return send(res,503,{error:'counter_unavailable'});
  }
};