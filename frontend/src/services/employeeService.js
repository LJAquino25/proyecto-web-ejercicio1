import { apiRequest } from './api'

export async function getEmployees({ role } = {}) {
  const query = new URLSearchParams()
  if (role) query.set('type', role)

  const suffix = query.toString()
  const data = await apiRequest(`/hr/employee${suffix ? `?${suffix}` : ''}`)
  if (!Array.isArray(data?.employee)) {
    throw new Error('La respuesta de empleados no es válida.')
  }
  return data.employee
}

export async function getPayrolls({ employeeId, period } = {}) {
  const query = new URLSearchParams()
  if (employeeId) query.set('employee_id', employeeId)
  if (period) query.set('period', period)

  const suffix = query.toString()
  const data = await apiRequest(`/hr/payroll${suffix ? `?${suffix}` : ''}`)
  if (!Array.isArray(data?.payroll)) {
    throw new Error('La respuesta de planillas no es válida.')
  }
  return data.payroll
}

export async function createPayroll({ employeeId, period, fortnight }) {
  return apiRequest('/hr/payroll', {
    method: 'POST',
    body: JSON.stringify({
      employee_id: employeeId,
      period,
      fortnight,
    }),
  })
}

export async function registerEmployee({
  branch_id,
  role,
  full_name,
  email,
  password,
  monthly_salary,
  is_active,
}) {
  return apiRequest('/hr/employee', {
    method: 'POST',
    body: JSON.stringify({
      branch_id,
      role,
      full_name,
      email,
      password,
      monthly_salary,
      is_active,
    }),
  })
}

export async function updateEmployee({
  id,
  branch_id,
  role,
  full_name,
  email,
  monthly_salary,
  is_active,
}) {
  return apiRequest('/hr/employee', {
    method: 'PUT',
    body: JSON.stringify({
      id,
      branch_id,
      role,
      full_name,
      email,
      monthly_salary,
      is_active,
    }),
  })
}
