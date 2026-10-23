const COUNTER_BASE='https://counterapi.com/api/chattopaper.com/pdf';
const PROD_KEY='generated-v2-20261023';
const QA_KEY='qa-generated-v2-20261023';
const START_NUMBER=2;

function send(res,status,body){
  res.statusCode=status;
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store, max-age=0');
  res.end(JSON.stringify(body));
}

function counterUrl(key,readOnly){
  const params=new URLSearchParams();
  params.set('startNumber',String(START_NUMBER));
  if(readOnly) params.set('readOnly','true');
  return `${COUNTER_BASE}/${encodeURIComponent(key)}?${params.toString()}`;
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='POST'){
    res.setHeader('allow','GET, POST');
    return send(res,405,{error:'method_not_allowed'});
  }
  try{
    const isQa=req.query&&String(req.query.qa||'')==='1';
    const key=isQa?QA_KEY:PROD_KEY;

    if(req.method==='POST'&&!isQa){
      const origin=String(req.headers&&req.headers.origin||'');
      if(origin&&origin!=='https://chattopaper.com'&&origin!=='https://www.chattopaper.com'){
        return send(res,403,{error:'forbidden_origin'});
      }
    }

    const upstream=await fetch(counterUrl(key,req.method==='GET'),{
      method:'GET',
      headers:{accept:'application/json'},
      cache:'no-store'
    });
    if(!upstream.ok) throw new Error('counter upstream '+upstream.status);
    const data=await upstream.json();
    const count=Number(data&&data.value);
    if(!Number.isFinite(count)) throw new Error('invalid counter response');
    return send(res,200,{count});
  }catch(error){
    console.error('pdf-count',error&&error.message?error.message:error);
    return send(res,503,{error:'counter_unavailable'});
  }
};