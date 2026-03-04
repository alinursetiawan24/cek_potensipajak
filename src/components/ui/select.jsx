
export function Select({value,onValueChange,children}){
  return <select value={value} onChange={(e)=>onValueChange(e.target.value)} className="border p-3 rounded w-full">{children}</select>
}
export function SelectTrigger({children}){ return children }
export function SelectValue({placeholder}){ return <option value="">{placeholder}</option> }
export function SelectContent({children}){ return children }
export function SelectItem({value,children}){ return <option value={value}>{children}</option> }
