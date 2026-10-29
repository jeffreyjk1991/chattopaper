const { Pool } = require('pg');

const pool = globalThis.__chattopaperPdfPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  ssl: { rejectUnauthorized: false }
});
globalThis.__chattopaperPdfPool = pool;

function send(res,status,body){
  res.statusCode=status;
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store, max-age=0');
  res.end(JSON.stringify(body));
}

function clean(value,max=300){
  const text=String(value||'').trim();
  return text ? text.slice(0,max) : null;
}

function decodeHeader(value){
  try{return decodeURIComponent(String(value||''));}catch(_){return String(value||'');}
}

function deviceType(userAgent){
  const ua=String(userAgent||'');
  if(/ipad|tablet|kindle|silk/i.test(ua)) return 'tablet';
  if(/mobi|android|iphone|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='POST'){
    res.setHeader('allow','GET, POST');
    return send(res,405,{error:'method_not_allowed'});
  }

  try{
    if(!process.env.DATABASE_URL) throw new Error('database_not_configured');

    if(req.method==='GET'){
      const {rows}=await pool.query('SELECT count(*)::bigint AS total FROM public.pdf_generation_events');
      return send(res,200,{count:Number(rows[0]?.total||0)});
    }

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

    const values=[
      eventId,
      clean(req.headers&&req.headers['x-vercel-ip-country'],8),
      clean(req.headers&&req.headers['x-vercel-ip-country-region'],80),
      clean(decodeHeader(req.headers&&req.headers['x-vercel-ip-city']),120),
      clean(req.headers&&req.headers['x-vercel-ip-timezone'],80),
      clean(input&&input.referrerHost,255),
      clean(input&&input.utmSource,120),
      clean(input&&input.utmMedium,120),
      clean(input&&input.utmCampaign,180),
      clean(input&&input.utmContent,180),
      clean(input&&input.utmTerm,180),
      clean(input&&input.landingPage,300),
      clean(deviceType(req.headers&&req.headers['user-agent']),32)
    ];

    await pool.query(
      'INSERT INTO public.pdf_generation_events(event_id,country,region,city,timezone,referrer_host,utm_source,utm_medium,utm_campaign,utm_content,utm_term,landing_page,device_type) VALUES ($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (event_id) DO NOTHING',
      values
    );

    const {rows}=await pool.query('SELECT count(*)::bigint AS total FROM public.pdf_generation_events');
    return send(res,200,{count:Number(rows[0]?.total||0)});
  }catch(error){
    console.error('pdf-count',error&&error.message?error.message:error);
    return send(res,503,{error:'counter_unavailable'});
  }
};
