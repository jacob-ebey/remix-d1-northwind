import { type LoaderArgs } from "@remix-run/cloudflare";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { AddTableField } from "~/components/tools";
import { maybeDefer } from "~/utils";

export function loader({ context, params }: LoaderArgs) {
  const supplierPromise = context.DB.prepare(
    `
    SELECT Id, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax, HomePage
    FROM Supplier
    WHERE Id = ?1
  `
  )
    .bind(params.id)
    .first<{
      Id: number;
      ContactName: string;
      CompanyName: string;
      ContactTitle: string;
      City: string;
      Country: string;
      Address: string;
      Region: string;
      PostalCode: string;
      Phone: string;
      Fax?: string;
      HomePage?: string;
    }>()
    .then((r) => r || null);

  return maybeDefer(context.session, {
    supplierPromise,
  });
}

export default function Supplier() {
  const { supplierPromise } = useLoaderData<typeof loader>();

  return (
    <Suspense
      fallback={
        <div className="card-content">
          <h2>Loading supplier...</h2>
        </div>
      }
    >
      <Await
        resolve={supplierPromise}
        children={(supplier) =>
          !supplier ? (
            <div className="card-content">
              <h2>Supplier not found</h2>
            </div>
          ) : (
            <div className="card mb-6">
              <header className="card-header">
                <p className="card-header-title">
                  <span className="icon material-icons">ballot</span>
                  <span className="ml-2">Supplier information</span>
                </p>
              </header>
              <div className="card-content">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <AddTableField
                      name="Company Name"
                      value={supplier.CompanyName}
                    />
                    <AddTableField
                      name="Contact Name"
                      value={supplier.ContactName}
                    />
                    <AddTableField
                      name="Contact Title"
                      value={supplier.ContactTitle}
                    />
                    <AddTableField name="Address" value={supplier.Address} />
                    <AddTableField name="City" value={supplier.City} />
                  </div>
                  <div>
                    <AddTableField name="Region" value={supplier.Region} />
                    <AddTableField
                      name="Postal Code"
                      value={supplier.PostalCode}
                    />
                    <AddTableField name="Country" value={supplier.Country} />
                    <AddTableField name="Phone" value={supplier.Phone} />
                    {supplier.Fax ? (
                      <AddTableField name="Fax" value={supplier.Fax} />
                    ) : (
                      false
                    )}
                    {supplier.HomePage ? (
                      <AddTableField
                        name="Home Page"
                        value={supplier.HomePage}
                      />
                    ) : (
                      false
                    )}
                  </div>
                </div>

                <hr />

                <div className="field grouped">
                  <div className="control">
                    <Link to="/suppliers" className="button red">
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
