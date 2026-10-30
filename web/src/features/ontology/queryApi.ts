export type GuidanceAsset={node_id:string;name?:string;metric_term?:string;type:string;status?:string;summary?:string;description?:string;condition?:string;action?:string;reason?:string;expression?:unknown;targets?:{sql_expression?:string}[];reference_bindings?:Record<string,string>};
export type GraphNode={id:string;name:string;node_type:string;properties:Record<string,unknown>;description?:string;sources?:unknown[];alternatives?:{alternative_id:string}[]};
export type QueryGraph={nodes:GraphNode[];edges:{id:string;from_node_id:string;to_node_id:string;edge_type:string}[]};
export type OntologySource={kind:'archive'|'run'|'import';id:string;label?:string};
export type Question={question_id:string;prompt:string;reason?:string;options:{option_id:string;statement:string;graph_refs?:string[]}[]};
export type Binding={binding_id:string;column_node_id?:string;node_ids:string[];start:number;end:number;expression:string;clause:string;match_status:string};
export type SqlRevision={id:string;sql:string;explanation:string;status:string;error?:string;graph_snapshot?:string;grounding?:{sql_hash:string;bindings:Binding[];declarations:{node_ids:string[];explanation:string}[]}};
export type QueryEvent={seq:number;type:string;created_at:string;payload:Record<string,unknown>};
export type QueryTask={id:string;session_id:string;question:string;status:string;phase:string;retrieval_mode?:string;state_version:number;last_event_seq:number;error:string|null;answer:string|null;initial_sql?:string;created_at:string;revision_of:string|null;interaction:{id:string;source:string;questions:Question[]}|null;confirmations:{prompt:string;selected_statements:string[];explanation:string;source:string}[];graphs:Record<string,QueryGraph>;retrieval_selection?:{relevant_node_ids:string[]}|null;context:{status:string|null;guidance:{guidance_content:string;usage?:string;ontology_assets?:GuidanceAsset[];interaction_guidance?:{guidance_id:string;should_be:string}[]}|null;projection_trace:{choice_point_id:string;retained_graph_refs:string[];removed_graph_refs:string[]}[];unresolved_choice_point_ids:string[]}|null;sql_revisions:SqlRevision[];result:{columns:string[];rows:unknown[][];row_count:number;truncated:boolean;elapsed_seconds:number}|null};
export type QuerySession={id:string;database_id:string;title:string;first_question?:string;created_at:string;ontology_source:OntologySource;tasks:QueryTask[]};
const base='/ontomosaic-db/api/nl2sql';
export const requestId=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
async function request<T>(path:string,data?:unknown):Promise<T>{
 const r=await fetch(base+path,data===undefined?undefined:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 if(!r.ok){const d=await r.json().catch(()=>null);throw new Error(typeof d?.detail==='string'?d.detail:JSON.stringify(d?.detail||`Request failed (${r.status})`));}return r.json();
}
export const queryApi={
 sources:(db:string)=>request<{sources:OntologySource[]}>(`/sources?database_id=${encodeURIComponent(db)}`),
 sessions:(db:string)=>request<{sessions:QuerySession[]}>(`/sessions?database_id=${encodeURIComponent(db)}`),
 session:(id:string)=>request<QuerySession>(`/sessions/${id}`),
 createSession:(database_id:string,ontology_source:OntologySource,id:string)=>request<QuerySession>('/sessions',{database_id,ontology_source:{kind:ontology_source.kind,id:ontology_source.id},request_id:id}),
 ask:(session:string,question:string,id:string,revision_of?:string)=>request<QueryTask>(`/sessions/${session}/tasks`,{question,request_id:id,revision_of:revision_of||null}),
 activity:(id:string)=>request<{events:QueryEvent[]}>(`/tasks/${id}/activity`),
 task:(id:string)=>request<QueryTask>(`/tasks/${id}`),
 answers:(task:QueryTask,answers:{question_id:string;selected_option_ids:string[];explanation:string}[],id:string)=>request<QueryTask>(`/tasks/${task.id}/answers`,{interaction_id:task.interaction?.id,expected_state_version:task.state_version,request_id:id,answers}),
 retry:(id:string)=>request<QueryTask>(`/tasks/${id}/retry`,{}),
 cancel:(id:string)=>request<QueryTask>(`/tasks/${id}/cancel`,{}),
 events:(id:string,after:number)=>`${base}/tasks/${id}/events?after=${after}`,
};
