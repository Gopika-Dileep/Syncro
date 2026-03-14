import { NavLink } from "react-router-dom"


const navItems = [
    {label:"Dashboard", path:"/employee/dashboard"},
    {label:"Projects", path:"/employee/projects"},
    {label:"Backlog", path:"/employee/backlog"},
    {label:"Sprints", path:"/employee/sprints"},
    {label:"Notification", path:"/employee/notification"},
    {label:"Settings", path:"/employee/settings"},
]

export default function EmployeeSidebar(){
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