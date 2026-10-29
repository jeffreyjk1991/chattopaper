import { Pool } from 'pg';
import { attachDatabasePool } from '@neon/functions';

const pool=new Pool({connectionString:process.env.DATABASE_URL,max:3});
attachDatabasePool(pool);

function json(status,body){
  return new Response(JSON.stringify(body),{
    status,
    headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}
  });
}

export default {
  async fetch(request){
    if(request.headers.get('x-counter-secret')!==process.env.COUNTER_SECRET){
      return json(401,{error:'unauthorized'});
    }

    if(request.method==='GET'){
      const {rows}=await pool.query('SELECT count(*)::bigint AS total FROM public.pdf_generation_events');
      return json(200,{count:Number(rows[0]?.total||0)});
    }

    if(request.method==='POST'){
      let body={};
      try{body=await request.json();}catch(_){}
      const eventId=String(body?.eventId||'');
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)){
        return json(400,{error:'invalid_event'});
      }
      const clean=(value,max=300)=>String(value||'').trim().slice(0,max)||null;
      await pool.query(
        'INSERT INTO public.pdf_generation_events(event_id,country,region,referrer_host,utm_source,utm_medium,utm_campaign,landing_page,device_type) VALUES ($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (event_id) DO NOTHING',
        [
          eventId,
          clean(body?.country,8),
          clean(body?.region,80),
          clean(body?.referrerHost||'direct',255),
          clean(body?.utmSource,120),
          clean(body?.utmMedium,120),
          clean(body?.utmCampaign,180),
          clean(body?.landingPage||'/',300),
          clean(body?.deviceType,32)
        ]
      );
      const {rows}=await pool.query('SELECT count(*)::bigint AS total FROM public.pdf_generation_events');
      return json(200,{count:Number(rows[0]?.total||0)});
    }

    return json(405,{error:'method_not_allowed'});
  }
};
