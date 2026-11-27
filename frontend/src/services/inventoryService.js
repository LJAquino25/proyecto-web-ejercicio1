import { apiRequest } from './api'

export async function getBranchInventory(branchId) {
  const data = await apiRequest(`/inventory/products?branch_id=${branchId}`)
  if (!Array.isArray(data)) {
    throw new Error('La respuesta del inventario no es válida.')
  }
  return data
}

export async function addInventorySupply({
  name,
  unit,
  branch_id,
  supplier_id,
  quantity,
  min_stock,
}) {
  return apiRequest('/inventory/products', {
    method: 'POST',
    body: JSON.stringify({
      name,
      unit,
      branch_id,
      supplier_id,
      quantity,
      min_stock,
    }),
  })
}

export async function getInventorySupplies() {
  const data = await apiRequest('/inventory/supplies')
  if (!Array.isArray(data)) {
    throw new Error('La respuesta de insumos no es válida.')
  }
  return data
}

export async function getAvailableInventorySupplies() {
  const data = await apiRequest('/inventory/supplies/available')
  if (!Array.isArray(data)) {
    throw new Error('La respuesta de insumos disponibles no es válida.')
  }
  return data
}

export async function getInventoryRecipes() {
  const data = await apiRequest('/inventory/recipes')
  if (!Array.isArray(data)) {
    throw new Error('La respuesta de recetas no es válida.')
  }
  return data
}

export async function createInventoryRecipe({
  product_id,
  name,
  ingredients,
}) {
  return apiRequest('/inventory/recipes', {
    method: 'POST',
    body: JSON.stringify({ product_id, name, ingredients }),
  })
}

export const updateInventoryRecipe = async (recipeId, ingredients) => {
  return await apiRequest(`/inventory/recipes/${recipeId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ingredients
    })
  })
}

export async function addCatalogProduct({
  name,
  price,
  productType,
  supplierId,
  unitCost,
  ingredients,
}) {
  return apiRequest('/inventory/catalog', {
    method: 'POST',
    body: JSON.stringify({
      name,
      price,
      productType,
      supplierId,
      unitCost,
      ingredients,
    }),
  })
}

export async function updateCatalogProduct(id, changes) {
  return apiRequest(`/inventory/catalog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  })
}

export async function prepareInventoryRecipe({ id, quantity, branch_id }) {
  return apiRequest('/inventory/prepare', {
    method: 'POST',
    body: JSON.stringify({ id, quantity, branch_id }),
  })
}

export async function getSuppliers() {
  const data = await apiRequest('/purchases/supplier')
  if (!Array.isArray(data?.suppliers)) {
    throw new Error('La respuesta de proveedores no es válida.')
  }
  return data.suppliers
}

export async function getPackagedProducts() {
  const data = await apiRequest('/inventory/catalog/details')

  if (!Array.isArray(data)) {
    throw new Error('La respuesta del catálogo no es válida.')
  }

  return data
    .filter(product => product.product_type === 'PACKAGED')
    .map(product => ({
      ...product,
      unit: 'UNIT'
    }))
}

export async function getBranchPackagedInventory(branchId) {
  const data = await apiRequest(
    `/inventory/packaged-inventory?branch_id=${encodeURIComponent(branchId)}`
  )

  if (!Array.isArray(data)) {
    throw new Error('La respuesta del inventario no es válida.')
  }

  return data
}
