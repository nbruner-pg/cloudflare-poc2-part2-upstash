import { Redis } from "@upstash/redis/cloudflare"

export interface Env {
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		if(request.method === "GET"){
			const { searchParams } = new URL(request.url);
			const message = searchParams.get('message');
			const key = searchParams.get('key');
			if(message){
				return new Response(`Tell the world: ${message}`);
			}
			if(key){
				const redis = Redis.fromEnv(env);
				const start = Date.now();
				const value = await redis.get(key);
				const end = Date.now();
  				const diff = end - start;
				if(value == null){
					return new Response(`Value not found for key '${key}'`, { status: 404 });
				}
				const response = new Response(`Successfully got upstash value for key '${key}':'${value}' in ${diff} ms.`);
				response.headers.append('Fetch-Time', diff.toString());
				return response;
			}
			return new Response("Hello World!");
		}

		if(request.method === "POST"){
			const body = await request.json<KVBody>();
			const redis = Redis.fromEnv(env);
			await redis.set(body.key, body.value);
			return new Response(`Successfully put upstash pair key:${body.key} with value:${body.value}`);
		}
		
		return new Response("Verb not supported!");
	},
};

class KVBody {
	public key: string = "";
	public value: string = "";
}