import { type LoaderArgs } from "@remix-run/cloudflare";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { AddTableField } from "~/components/tools";
import { maybeDefer } from "~/utils";

export function loader({ context, params }: LoaderArgs) {
  const ordersQuery = context.DB.prepare(
    `
      SELECT Shipper.CompanyName AS ShipViaCompanyName, SUM(OrderDetail.UnitPrice * OrderDetail.Discount * OrderDetail.Quantity) AS TotalProductsDiscount, SUM(OrderDetail.UnitPrice * OrderDetail.Quantity) AS TotalProductsPrice, SUM(OrderDetail.Quantity) AS TotalProductsItems, COUNT(OrderDetail.OrderId) AS TotalProducts, "Order".Id, CustomerId, EmployeeId, OrderDate, RequiredDate, ShippedDate, ShipVia, Freight, ShipName, ShipAddress, ShipCity, ShipRegion, ShipPostalCode, ShipCountry, ProductId
      FROM "Order", OrderDetail, Shipper
      WHERE OrderDetail.OrderId = "Order".Id AND "Order".Id = ?1 AND "Order".ShipVia = Shipper.Id
      GROUP BY "Order".Id
    `
  ).bind(params.id);

  const productsQuery = context.DB.prepare(
    `
      SELECT OrderDetail.OrderId, OrderDetail.Quantity, OrderDetail.UnitPrice AS OrderUnitPrice, OrderDetail.Discount, Product.Id, ProductName, SupplierId, CategoryId, QuantityPerUnit, Product.UnitPrice AS ProductUnitPrice, UnitsInStock, UnitsOnOrder, ReorderLevel, Discontinued
      FROM Product, OrderDetail
      WHERE OrderDetail.OrderId = ?1 AND OrderDetail.ProductId = Product.Id
    `
  ).bind(params.id);

  const orderPromise = context.DB.batch([ordersQuery, productsQuery]).then(
    ([ordersResult, productsResult]) => {
      const orders = (ordersResult.results || []) as {
        OrderId: number;
        Quantity: number;
        CustomerId: number;
        ShipName: string;
        TotalProducts: number;
        TotalProductsItems: number;
        TotalProductsPrice: number;
        TotalProductsDiscount: number;
        ShipViaCompanyName: string;
        Freight: number;
        OrderDate: string;
        RequiredDate: string;
        ShippedDate: string;
        ShipCity: string;
        ShipRegion: string;
        ShipPostalCode: string;
        ShipCountry: string;
      }[];
      const products = (productsResult.results || []) as {
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
        OrderUnitPrice: number;
        Quantity: number;
        Discount: number;
      }[];

      return {
        stats: {
          results: products.length + 1,
        },
        order: (orders ? orders[0] : {}) as typeof orders[0],
        products: products,
      };
    }
  );

  return maybeDefer(context.session, {
    orderPromise,
  });
}

export default function Product() {
  const { orderPromise } = useLoaderData<typeof loader>();

  return (
    <Suspense
      fallback={
        <div className="card-content">
          <h2>Loading order...</h2>
        </div>
      }
    >
      <Await
        resolve={orderPromise}
        children={({ order, products }) =>
          !order ? (
            <div className="card-content">
              <h2>Order not found</h2>
            </div>
          ) : (
            <div className="card mb-6">
              <header className="card-header">
                <p className="card-header-title">
                  <span className="icon material-icons">ballot</span>
                  <span className="ml-2">Order information</span>
                </p>
              </header>
              <div className="card-content">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <AddTableField
                      name="Customer Id"
                      link={`/customer/${order.CustomerId}`}
                      value={order.CustomerId}
                    />
                    <AddTableField name="Ship Name" value={order.ShipName} />
                    <AddTableField
                      name="Total Products"
                      value={order.TotalProducts}
                    />
                    <AddTableField
                      name="Total Quantity"
                      value={order.TotalProductsItems}
                    />
                    <AddTableField
                      name="Total Price"
                      value={`$${order.TotalProductsPrice.toFixed(2)}`}
                    />
                    <AddTableField
                      name="Total Discount"
                      value={`$${order.TotalProductsDiscount.toFixed(2)}`}
                    />
                    <AddTableField
                      name="Ship Via"
                      value={order.ShipViaCompanyName}
                    />
                    <AddTableField
                      name="Freight"
                      value={`$${order.Freight.toFixed(2)}`}
                    />
                  </div>
                  <div>
                    <AddTableField name="Order Date" value={order.OrderDate} />
                    <AddTableField
                      name="Required Date"
                      value={order.RequiredDate}
                    />
                    <AddTableField
                      name="Shipped Date"
                      value={order.ShippedDate}
                    />
                    <AddTableField name="Ship City" value={order.ShipCity} />
                    <AddTableField
                      name="Ship Region"
                      value={order.ShipRegion}
                    />
                    <AddTableField
                      name="Ship Postal Code"
                      value={order.ShipPostalCode}
                    />
                    <AddTableField
                      name="Ship Country"
                      value={order.ShipCountry}
                    />
                  </div>
                </div>
              </div>
              <div className="card has-table">
                <header className="card-header">
                  <p className="card-header-title">Products in Order</p>
                </header>
                <div className="card-content">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Order Price</th>
                        <th>Total Price</th>
                        <th>Discount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, index) => {
                        return (
                          <tr key={product.Id}>
                            <td data-label="Product">
                              <Link
                                className="link"
                                to={`/product/${product.Id}`}
                              >
                                {product.ProductName}
                              </Link>
                            </td>
                            <td data-label="Quantity">{product.Quantity}</td>
                            <td data-label="OrderPrice">{`$${product.OrderUnitPrice.toFixed(
                              2
                            )}`}</td>
                            <td data-label="TotalPrice">{`$${(
                              product.OrderUnitPrice * product.Quantity
                            ).toFixed(2)}`}</td>
                            <td data-label="Discount">{`${
                              product.Discount * 100
                            }%`}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-content">
                <div className="field grouped">
                  <div className="control">
                    <Link to="/orders" className="button red">
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
