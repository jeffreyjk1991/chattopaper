const {Pool}=require('pg');
const pool=globalThis.__chattopaperWrappedEventPool||new Pool({connectionString:process.env.DATABASE_URL,max:2,idleTimeoutMillis:30000,connectionTimeoutMillis:5000});
globalThis.__chattopaperWrappedEventPool=pool;
const platforms=new Set(['whatsapp','telegram','meta','imessage','sms']);
function send(res,status,body){res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.setHeader('cache-control','no-store, max-age=0');res.setHeader('x-robots-tag','noindex');res.end(JSON.stringify(body))}
module.exports=async function(req,res){
 if(!['GET','POST'].includes(req.method)){res.setHeader('allow','GET, POST');return send(res,405,{error:'method_not_allowed'})}
 if(req.method==='POST'){
  const origin=req.headers?.origin;
  if(!['https://chattopaper.com','https://www.chattopaper.com'].includes(origin))return send(res,403,{error:'forbidden_origin'});
  if(req.headers?.['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin')return send(res,403,{error:'forbidden_origin'});
  let body=req.body;if(typeof body==='string'){try{body=JSON.parse(body)}catch(_){body=null}}
  if(!body||typeof body.eventId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.eventId)||!platforms.has(body.platform))return send(res,400,{error:'invalid_event'});
  try{if(!process.env.DATABASE_URL)throw Error('database_not_configured');await pool.query('INSERT INTO public.wrapped_generation_events(event_id,platform) VALUES ($1::uuid,$2) ON CONFLICT (event_id) DO NOTHING',[body.eventId,body.platform]);return send(res,200,{ok:true})}catch(e){console.error('wrapped-count',e.code||'database_error');return send(res,503,{error:'counter_unavailable'})}
 }
 try{if(!process.env.DATABASE_URL)throw Error('database_not_configured');const {rows}=await pool.query('SELECT count(*)::bigint AS total FROM public.wrapped_generation_events');return send(res,200,{count:Number(rows[0]?.total||0)})}catch(e){console.error('wrapped-count',e.code||'database_error');return send(res,503,{error:'counter_unavailable'})}
};
