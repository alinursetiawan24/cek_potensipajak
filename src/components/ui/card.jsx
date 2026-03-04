
export function Card({children,className=""}){
  return <div className={"bg-white rounded-xl shadow "+className}>{children}</div>
}
export function CardHeader({children}){
  return <div className="p-6 border-b">{children}</div>
}
export function CardTitle({children,className=""}){
  return <h3 className={"font-semibold "+className}>{children}</h3>
}
export function CardContent({children,className=""}){
  return <div className={"p-6 "+className}>{children}</div>
}
