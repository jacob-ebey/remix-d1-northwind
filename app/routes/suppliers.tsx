import { Suspense } from "react";
import { type LoaderArgs } from "@remix-run/cloudflare";
import { Await, Link, useLoaderData, useRevalidator } from "@remix-run/react";

import { maybeDefer } from "~/utils";

export async function loader({ context }: LoaderArgs) {
  const suppliersPromise = context.DB.prepare(
    `
    SELECT Id, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax, HomePage
    FROM Supplier
    LIMIT ?1
    OFFSET ?2
  `
  )
    .bind(20, 0)
    .all<{
      Id: number;
      ContactName: string;
      CompanyName: string;
      ContactTitle: string;
      City: string;
      Country: string;
    }>()
    .then((res) => res.results);

  return maybeDefer(context.session, {
    suppliersPromise: suppliersPromise,
  });
}

export default function Suppliers() {
  const { suppliersPromise } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  return (
    <Suspense
      fallback={
        <div className="card-content">
          <h2>Loading suppliers...</h2>
        </div>
      }
    >
      <Await
        resolve={suppliersPromise}
        children={(suppliers) =>
          suppliers.length === 0 ? (
            <div className="card-content">
              <h2>No suppliers...</h2>
            </div>
          ) : (
            <div className="card has-table">
              <header className="card-header">
                <p className="card-header-title">Suppliers</p>
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
                      <th></th>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Title</th>
                      <th>City</th>
                      <th>Country</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier) => {
                      return (
                        <tr key={supplier.Id}>
                          <td className="image-cell">
                            <div className="image">
                              <img
                                alt=""
                                src={`https://avatars.dicebear.com/v2/initials/${
                                  supplier.ContactName.split(" ")[0]
                                }-${
                                  supplier.ContactName.split(" ").slice(-1)[0]
                                }.svg`}
                                className="rounded-full"
                              />
                            </div>
                          </td>
                          <td data-label="Company">
                            <Link
                              className="link"
                              to={`/supplier/${supplier.Id}`}
                            >
                              {supplier.CompanyName}
                            </Link>
                          </td>
                          <td data-label="Contact">{supplier.ContactName}</td>
                          <td data-label="Title">{supplier.ContactTitle}</td>
                          <td data-label="Title">{supplier.City}</td>
                          <td data-label="Title">{supplier.Country}</td>
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
