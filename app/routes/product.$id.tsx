import { type LoaderArgs } from "@remix-run/cloudflare";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { AddTableField } from "~/components/tools";
import { maybeDefer } from "~/utils";

export function loader({ context, params }: LoaderArgs) {
  const productPromise = context.DB.prepare(
    `
    SELECT Product.Id, ProductName, SupplierId, CategoryId, QuantityPerUnit, UnitPrice, UnitsInStock, UnitsOnOrder, ReorderLevel, Discontinued, Supplier.CompanyName AS SupplierName
    FROM Product, Supplier
    WHERE Product.Id = ?1 AND Supplier.Id=Product.SupplierId
  `
  )
    .bind(params.id)
    .first<{
      Id: number;
      ProductName: string;
      SupplierId: string;
      CategoryId: string;
      QuantityPerUnit: string;
      UnitPrice: string;
      UnitsInStock: string;
      UnitsOnOrder: string;
      ReorderLevel: string;
      Discontinued: string;
      SupplierName: string;
    }>()
    .then((r) => r || null);

  return maybeDefer(context.session, {
    productPromise,
  });
}

export default function Product() {
  const { productPromise } = useLoaderData<typeof loader>();

  return (
    <Suspense
      fallback={
        <div className="card-content">
          <h2>Loading product...</h2>
        </div>
      }
    >
      <Await
        resolve={productPromise}
        children={(product) =>
          !product ? (
            <div className="card-content">
              <h2>Product not found</h2>
            </div>
          ) : (
            <div className="card mb-6">
              <header className="card-header">
                <p className="card-header-title">
                  <span className="icon material-icons">ballot</span>
                  <span className="ml-2">Product information</span>
                </p>
              </header>

              <div className="card-content">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <AddTableField
                      name="Product Name"
                      value={product.ProductName}
                    />
                    <AddTableField
                      name="Supplier"
                      link={`/supplier/${product.SupplierId}`}
                      value={product.SupplierName}
                    />
                    <AddTableField
                      name="Quantity Per Unit"
                      value={product.QuantityPerUnit}
                    />
                    <AddTableField
                      name="Unit Price"
                      value={`$${product.UnitPrice}`}
                    />
                  </div>
                  <div>
                    <AddTableField
                      name="Units In Stock"
                      value={product.UnitsInStock}
                    />
                    <AddTableField
                      name="Units In Order"
                      value={product.UnitsOnOrder}
                    />
                    <AddTableField
                      name="Reorder Level"
                      value={product.ReorderLevel}
                    />
                    <AddTableField
                      name="Discontinued"
                      value={product.Discontinued}
                    />
                  </div>
                </div>

                <hr />

                <div className="field grouped">
                  <div className="control">
                    <Link to="/products" className="button red">
                      Go back
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      />
    </Suspense>
  );
}
