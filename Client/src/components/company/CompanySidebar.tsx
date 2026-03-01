import { NavLink } from "react-router-dom"


const navItems = [
    {label:"Dashboard", path:"/company/dashboard"},
    {label:"Employees", path:"/company/employees"},
    {label:"Projects", path:"/company/projects"},
    {label:"Notifications", path:"/company/notification"},
    {label:"Settings", path:"/company/settings"},
]

export default function CompanySidebar(){
    return (
        <aside>
            <h2>Syncro</h2>
            <nav>
                <ul style={{listStyle:"none",padding:0}}>
                    {navItems.map((item)=>(
                        <li key={item.path}>
                            <NavLink to={item.path} style={({isActive})=>({
                                    fontWeight: isActive ? "bold" : "normal",
                                    textDecoration: "none",
                                    display: "block",
                                    padding: "8px",
                            })}>{item.label}</NavLink>
                        </li>
                    )
                    
                    )}
                </ul>
            </nav>
        </aside>

    )
}