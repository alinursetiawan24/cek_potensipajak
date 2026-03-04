
export function Button({children,variant,onClick,className=""}){
  let style="px-4 py-2 rounded "
  if(variant==="outline") style+="border "
  else style+="bg-blue-600 text-white "
  return <button onClick={onClick} className={style+className}>{children}</button>
}
