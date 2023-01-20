import { Suspense } from "react";
import { type LoaderArgs } from "@remix-run/cloudflare";
import {
  Await,
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";

import { maybeDefer } from "~/utils";

export function loader({ context, request }: LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const table = url.searchParams.get("t") || "products";

  const searchPromise = !query
    ? // TODO: this shouldn't be needed and is a bug in remix
      (null as unknown as Promise<any[]>)
    : context.DB.prepare(
        table == "products"
          ? `
          SELECT Id, ProductName, SupplierId, CategoryId, QuantityPerUnit, UnitPrice, UnitsInStock, UnitsOnOrder, ReorderLevel, Discontinued
          FROM Product
          WHERE ProductName
          LIKE ?2
          LIMIT ?1
        `
          : `
          SELECT Id, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax
          FROM Customer
          WHERE CompanyName LIKE ?2 OR ContactName LIKE ?2 OR ContactTitle LIKE ?2 OR Address LIKE ?2
          LIMIT ?1`
      )
        .bind(50, `%${query}%`)
        .all()
        .then((res) => res.results);

  return maybeDefer(context.session, {
    searchPromise,
  });
}

export default function Search() {
  const { searchPromise } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const table = searchParams.get("t") || "products";

  return (
    <div className="card">
      <div className="card-content">
        <Form
          replace
          onChange={(event) => {
            if (
              event.target instanceof HTMLInputElement &&
              event.target.name === "t"
            ) {
              const searchParams = new URLSearchParams();
              searchParams.set("q", query);
              searchParams.set("t", event.target.value);
              navigate(`?${searchParams.toString()}`, { replace: true });
            }
          }}
        >
          <div className="field">
            <label className="label">Search Database</label>
            <div className="field-body">
              <div className="field">
                <div className="control icons-left">
                  <input
                    type="text"
                    name="q"
                    placeholder="Enter keyword..."
                    defaultValue={query}
                    className="input w-1/2"
                  />
                  <button type="submit" className="icon left material-icons">
                    search
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="label">Tables</label>
            <div className="field-body">
              <div className="field grouped multiline">
                <div className="control">
                  <label className="radio">
                    <input
                      type="radio"
                      name="t"
                      value="products"
                      defaultChecked={table === "products"}
                    />
                    <span className="check"></span>
                    <span className="control-label">Products</span>
                  </label>
                </div>
                <div className="control">
                  <label className="radio">
                    <input
                      type="radio"
                      name="t"
                      value="customers"
                      defaultChecked={table === "customers"}
                    />
                    <span className="check"></span>
                    <span className="control-label">Customers</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Form>

        <p className="text-black font-bold text-lg">Search results</p>
        <Suspense fallback={<p className="mt-6">Loading...</p>}>
          <Await resolve={searchPromise}>
            {(results) => {
              if (!results || results.length === 0) {
                return <p className="mt-6">No results</p>;
              }
              return (
                <ul>
                  {results.map((r: any, idx) => (
                    <li key={r.Id}>
                      {table == "products" ? (
                        <>
                          <span className="block text-base mt-2 link">
                            <Link to={`/product/${r.Id}`}>{r.ProductName}</Link>
                          </span>
                          <span className="block text-gray-400 text-sm">
                            #{idx + 1}, Quantity Per Unit: {r.QuantityPerUnit},
                            Price: {r.UnitPrice}, Stock: {r.UnitsInStock}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="block text-base mt-2 link">
                            <Link to={`/customer/${r.Id}`}>
                              {r.CompanyName}
                            </Link>
                          </span>
                          <span className="block text-gray-400 text-sm">
                            #{idx + 1}, Contact: {r.ContactName}, Title:{" "}
                            {r.ContactTitle}, Phone: {r.Phone}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
