import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Package,
  Store,
  BookOpen,
  Truck,
  Receipt,
  Users
} from 'lucide-react'

export const adminModules = [
  {
    name: 'General',
    items: [
      {
        name: 'Resumen',
        path: '/staff',
        icon: LayoutDashboard
      }
    ]
  },
  {
    name: 'Operaciones',
    items: [
      {
        name: 'Ventas y facturación',
        path: '/staff/sales',
        icon: ShoppingCart,
        description: 'Administración de pedidos, ventas y facturas.',
        color: 'pink'
      },
      {
        name: 'Caja',
        path: '/staff/cash',
        icon: Wallet,
        description: 'Aperturas, cierres y movimientos de caja.',
        color: 'yellow'
      }
    ]
  },
  {
    name: 'Inventario',
    items: [
      {
        name: 'Existencias',
        path: '/staff/inventory',
        icon: Package,
        description: 'Control de insumos y existencias por sucursal.',
        color: 'blue'
      },
      {
        name: 'Catálogo',
        path: '/staff/catalog',
        icon: Store,
        description: 'Administración de productos para la venta.',
        color: 'pink'
      },
      {
        name: 'Recetas',
        path: '/staff/recipes',
        icon: BookOpen,
        description: 'Gestión de ingredientes y preparaciones.',
        color: 'yellow'
      }
    ]
  },
  {
    name: 'Administración',
    items: [
      {
        name: 'Compras y proveedores',
        path: '/staff/purchases',
        icon: Truck,
        description: 'Proveedores y órdenes de compra.',
        color: 'blue'
      },
      {
        name: 'Gastos',
        path: '/staff/expenses',
        icon: Receipt,
        description: 'Registro y control de gastos.',
        color: 'yellow'
      },
      {
        name: 'Personal y planilla',
        path: '/staff/team',
        icon: Users,
        description: 'Administración de empleados y planillas.',
        color: 'pink'
      }
    ]
  }
]