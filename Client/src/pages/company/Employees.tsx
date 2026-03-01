import { toggleBlockEmployeeApi, getEmployeesApi } from "@/api/employeeApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"


interface Employee {
    _id: string
    user_id: { _id: string, name: string; email: string; is_blocked: boolean }
    designation?: string
    date_of_joining?: string
    phone?: string
    skills: string[]
}


export default function Employees() {
    const navigate = useNavigate()

    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getEmployeesApi()
                setEmployees(data.data)
            } catch {
                setError("failed to load employees")
            } finally {
                setLoading(false)
            }
        }
        fetchEmployees()
    }, [])


    const updateBlockStatus = (userId: string, is_blocked: boolean) => {
        setEmployees((prev) =>
            prev.map((emp) =>
                emp.user_id._id === userId
                    ? { ...emp, user_id: { ...emp.user_id, is_blocked } }
                    : emp
            )
        )
    }



    const handleToggleBlock = async (userId: string) => {
        try {
            const data = await toggleBlockEmployeeApi(userId)
            updateBlockStatus(userId, data.isBlocked)
        } catch {
            alert("Failed to update employee status")
        } finally {
            setOpenMenuId(null)
        }
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h1>Employees</h1>
                <button onClick={() => navigate('/company/employees/add')}>
                    Add Employee
                </button>

            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && employees.length === 0 && (
                <p>NO employees yet. Add your first employee!</p>
            )}

            {!loading && employees.length !== 0 && (
                <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Designation</th>
                            <th>Phone</th>
                            <th>skills</th>
                            <th>status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp._id}>
                                <td>{emp.user_id?.name}</td>
                                <td>{emp.user_id?.email}</td>
                                <td>{emp.designation || "-"}</td>
                                <td>{emp.phone || "-"}</td>
                                <td>{emp.skills?.join(",") || "-"}</td>
                                <td style={{ color: emp.user_id?.is_blocked ? "red" : "green" }}>
                                    {emp.user_id?.is_blocked ? "Blocked" : "Active"}
                                </td>

                                <td style={{ position: "relative" }}>
                                    <button
                                        onClick={() =>
                                            setOpenMenuId(openMenuId === emp._id ? null : emp._id)
                                        }
                                    >
                                        • • •
                                    </button>

                                    {openMenuId === emp._id && (
                                        <div style={{
                                            position: "absolute",
                                            right: 0,
                                            background: "#fff",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            zIndex: 10,
                                            minWidth: "130px",
                                        }}>

                                            <button
                                                onClick={() => handleToggleBlock(emp.user_id._id)}
                                                style={{
                                                    display: "block",
                                                    width: "100%",
                                                    padding: "8px 16px",
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",

                                                    color: emp.user_id?.is_blocked ? "green" : "red",
                                                    textAlign: "left",
                                                }}
                                            >

                                                {emp.user_id?.is_blocked ? "✓ Unblock" : "🚫 Block"}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    )
}
