import { Suspense } from "react";
import { type LoaderArgs } from "@remix-run/cloudflare";
import { Await, Link, useLoaderData, useRevalidator } from "@remix-run/react";

import { maybeDefer } from "~/utils";

export function loader({ context }: LoaderArgs) {
  const ordersPromise = context.DB.prepare(
    `
    SELECT SUM(OrderDetail.UnitPrice * OrderDetail.Discount * OrderDetail.Quantity) AS TotalProductsDiscount, SUM(OrderDetail.UnitPrice * OrderDetail.Quantity) AS TotalProductsPrice, SUM(OrderDetail.Quantity) AS TotalProductsItems, COUNT(OrderDetail.OrderId) AS TotalProducts, "Order".Id, CustomerId, EmployeeId, OrderDate, RequiredDate, ShippedDate, ShipVia, Freight, ShipName, ShipAddress, ShipCity, ShipRegion, ShipPostalCode, ShipCountry, ProductId FROM "Order", OrderDetail
    WHERE OrderDetail.OrderId = "Order".Id
    GROUP BY "Order".Id
    LIMIT ?1
    OFFSET ?2
  `
  )
    .bind(20, 0)
    .all<{
      Id: number;
      TotalProductsDiscount: number;
      TotalProductsPrice: number;
      TotalProductsItems: number;
      TotalProducts: number;
      CustomerId: string;
      EmployeeId: string;
      OrderDate: string;
      RequiredDate: string;
      ShippedDate: string;
      ShipVia: string;
      Freight: string;
      ShipName: string;
      ShipAddress: string;
      ShipCity: string;
      ShipRegion: string;
      ShipPostalCode: string;
      ShipCountry: string;
      ProductId: number;
      OrderDetail: string;
    }>()
    .then((res) => res.results);

  return maybeDefer(context.session, {
    ordersPromise,
  });
}

export default function Orders() {
  const { ordersPromise } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  return (
    <Suspense
      fallback={
        <div className="card-content">
          <h2>Loading products...</h2>
        </div>
      }
    >
      <Await
        resolve={ordersPromise}
        children={(orders) =>
          orders.length === 0 ? (
            <div className="card-content">
              <h2>No orders...</h2>
            </div>
          ) : (
            <div className="card has-table">
              <header className="card-header">
                <p className="card-header-title">Orders</p>
                <button
                  className="card-header-icon"
                  onClick={() => {
                    revalidator.revalidate();
                  }}
                >
                  <span className="material-icons">redo</span>
                </button>
              </header>
              <div className="card-content">
                <table>
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Total Price</th>
                      <th>Products</th>
                      <th>Quantity</th>
                      <th>Shipped</th>
                      <th>Ship Name</th>
                      <th>City</th>
                      <th>Country</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => {
                      return (
                        <tr key={order.Id}>
                          <td data-label="Id">
                            <Link className="link" to={`/order/${order.Id}`}>
                              {order.Id}
                            </Link>
                          </td>
                          <td data-label="Price">{`$${order.TotalProductsPrice.toFixed(
                            2
                          )}`}</td>
                          <td data-label="Products">{order.TotalProducts}</td>
                          <td data-label="Quantity">
                            {order.TotalProductsItems}
                          </td>
                          <td data-label="Date">{order.OrderDate}</td>
                          <td data-label="Name">{order.ShipName}</td>
                          <td data-label="City">{order.ShipCity}</td>
                          <td data-label="Country">{order.ShipCountry}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* <Paginate pages={pages} page={page} setPage={setPage} /> */}
              </div>
            </div>
          )
        }
      />
    </Suspense>
  );
}
