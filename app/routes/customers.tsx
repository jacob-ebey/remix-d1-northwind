import { Suspense } from "react";
import { type LoaderArgs } from "@remix-run/cloudflare";
import { Await, Link, useLoaderData, useRevalidator } from "@remix-run/react";

import { maybeDefer } from "~/utils";

export function loader({ context }: LoaderArgs) {
  const customersPromise = context.DB.prepare(
    `
    SELECT Id, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax
    FROM Customer
    LIMIT ?1
    OFFSET ?2
  `
  )
    .bind(20, 0)
    .all<{
      Id: string;
      CompanyName: string;
      ContactName: string;
      ContactTitle: string;
      Address: string;
      City: string;
      Region: string;
      PostalCode: string;
      Country: string;
      Phone: string;
      Fax: string;
    }>()
    .then((res) => res.results);

  return maybeDefer(context.session, {
    customersPromise,
  });
}

export default function Customers() {
  const { customersPromise } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  return (
    <Suspense
      fallback={
        <div className="card-content">
          <h2>Loading customers...</h2>
        </div>
      }
    >
      <Await
        resolve={customersPromise}
        children={(customers) =>
          customers.length === 0 ? (
            <div className="card-content">
              <h2>No customers...</h2>
            </div>
          ) : (
            <div className="card has-table">
              <header className="card-header">
                <p className="card-header-title">Customers</p>
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
                    {customers.map((customer, index) => {
                      return (
                        <tr key={customer.Id}>
                          <td className="image-cell">
                            <div className="image">
                              <img
                                alt=""
                                src={`https://avatars.dicebear.com/v2/initials/${
                                  customer.ContactName.split(" ")[0]
                                }-${
                                  customer.ContactName.split(" ").slice(-1)[0]
                                }.svg`}
                                className="rounded-full"
                              />
                            </div>
                          </td>
                          <td data-label="Company">
                            <Link
                              className="link"
                              to={`/customer/${customer.Id}`}
                            >
                              {customer.CompanyName}
                            </Link>
                          </td>
                          <td data-label="Contact">{customer.ContactName}</td>
                          <td data-label="Title">{customer.ContactTitle}</td>
                          <td data-label="City">{customer.City}</td>
                          <td data-label="Country">{customer.Country}</td>
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
