import type {Database, GraphData, InputFile, Pair, Run, Table} from './types';
const base='/ontomosaic-text2sql/api';
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const r=await fetch(base+path,init);
  if(!r.ok){const d=await r.json().catch(()=>null);throw new Error(typeof d?.detail==='string'?d.detail:`Request failed (${r.status})`);}
  return r.json();
}
const post=<T,>(path:string,data:unknown)=>request<T>(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
export const api={
  health:()=>request<{training_ready:boolean;training_error:string|null}>('/health'),
  databases:()=>request<{databases:Database[]}>('/databases'),
  uploadDatabase:(file:File)=>{const body=new FormData();body.append('file',file);return request<Database>('/databases/upload',{method:'POST',body});},
  schema:(id:string)=>request<{tables:Table[]}>(`/databases/${encodeURIComponent(id)}/schema`),
  rows:(id:string,table:string,offset:number)=>request<{columns:string[];rows:unknown[][];has_more:boolean}>(`/databases/${encodeURIComponent(id)}/rows?table=${encodeURIComponent(table)}&offset=${offset}`),
  upload:(db:string,file:File)=>{const body=new FormData();body.append('file',file);return request<InputFile>(`/training-files?database_id=${encodeURIComponent(db)}`,{method:'POST',body});},
  input:(id:string)=>request<InputFile>(`/imports/${id}`),
  pairs:(id:string,offset:number)=>request<{pairs:Pair[];total:number}>(`/imports/${id}/pairs?offset=${offset}&limit=5`),
  importPairs:(id:string)=>post<InputFile>('/imports',{file_id:id}),
  train:(id:string)=>{
    const requestId=Array.from(crypto.getRandomValues(new Uint8Array(16)),byte=>byte.toString(16).padStart(2,'0')).join('');
    return post<Run>('/sql-train',{import_id:id,request_id:requestId,mode:'live',case_limit:2});
  },
  runs:(db:string)=>request<{runs:Run[]}>(`/runs?database_id=${encodeURIComponent(db)}`),
  run:(id:string)=>request<Run>(`/runs/${id}`),
  runGraph:(id:string)=>request<GraphData>(`/runs/${id}/graph`),
  archive:(db:string)=>request<GraphData>(`/databases/${encodeURIComponent(db)}/graph`),
  graph:(id:string)=>request<GraphData>(`/graphs/${id}`),
  importGraph:(file:File)=>{const body=new FormData();body.append('file',file);return request<GraphData>('/graphs/import',{method:'POST',body});},
  examples:(db:string)=>`${base}/databases/${encodeURIComponent(db)}/example-pairs`,
};
export function download(url:string,name:string){const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
