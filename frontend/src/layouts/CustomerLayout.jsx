import { Outlet } from 'react-router-dom'
import CustomerNavbar from '../components/customers/CustomerNavbar'

function CustomerLayout() {
  return (
    <>
      <CustomerNavbar />

      <Outlet />
    </>
  )
}

export default CustomerLayout