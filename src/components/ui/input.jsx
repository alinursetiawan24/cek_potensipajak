
export function Input(props){
  return <input {...props} className={"border p-3 rounded w-full "+(props.className||"")}/>
}
