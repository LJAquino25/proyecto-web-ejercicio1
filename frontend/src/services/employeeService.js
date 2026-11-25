import { apiRequest } from './api'

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
