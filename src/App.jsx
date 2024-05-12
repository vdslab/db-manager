import { useState } from "react";
import useSWR, { mutate } from "swr";

async function fetcher(...args) {
  const response = await fetch(...args);
  return response.json();
}

function DatabaseCreateForm() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            setLoading(true);
            const response = await fetch(
              "/.netlify/functions/create-database",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  databaseName: event.target.elements.databaseName.value,
                  userName: event.target.elements.userName.value,
                }),
              },
            );
            const data = await response.json();
            if (response.status != 200) {
              throw new Error(data.message);
            }
            setResult(data);
            setLoading(false);
            mutate("/netlify/functions/list-database");
            mutate("/netlify/functions/list-user");
            event.target.elements.databaseName.value = "";
            event.target.elements.userName.value = "";
          } catch (e) {
            console.error(e);
            setLoading(false);
          }
        }}
      >
        <div className="field">
          <label className="label">Database Name</label>
          <div className="control">
            <input className="input" type="text" name="databaseName" required />
          </div>
        </div>
        <div className="field">
          <label className="label">User Name</label>
          <div className="control">
            <input className="input" type="text" name="userName" required />
          </div>
        </div>
        <div className="field">
          <div className="control">
            <button
              className={`button${loading ? " is-loading" : ""}`}
              type="submit"
            >
              Create
            </button>
          </div>
        </div>
        {result && (
          <div className="field">
            <label className="label">.env File</label>
            <div className="control">
              <textarea
                className="textarea"
                rows="5"
                value={`PGHOST=35.187.197.185
PGPORT=5432
PGDATABASE=${result.databaseName}
PGUSER=${result.userName}
PGPASSWORD=${result.password}`}
                readOnly
              />
            </div>
          </div>
        )}
      </form>
    </>
  );
}

function DatabaseList() {
  const [search, setSearch] = useState("");
  const { data: databases, isLoading } = useSWR(
    "/.netlify/functions/list-database",
    fetcher,
  );
  return (
    <>
      <div className="field">
        <div className="control">
          <input
            className="input is-rounded"
            type="text"
            placeholder="Database Name"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </div>
      </div>
      <div className="table-container">
        <table className="table is-bordered is-fullwidth">
          <thead>
            <tr>
              <th>datname</th>
              <th>encoding</th>
              <th>datcollate</th>
              <th>datctype</th>
              <th>datconnlimit</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              databases
                .filter(
                  (database) => !search || database.datname.includes(search),
                )
                .map((database) => {
                  return (
                    <tr key={database.oid}>
                      <td>{database.datname}</td>
                      <td>{database.encoding}</td>
                      <td>{database.datcollate}</td>
                      <td>{database.datctype}</td>
                      <td>{database.datconnlimit}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function UserList() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useSWR(
    "/.netlify/functions/list-user",
    fetcher,
  );
  return (
    <>
      <div className="field">
        <div className="control">
          <input
            className="input is-rounded"
            type="text"
            placeholder="Database Name"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </div>
      </div>
      <div className="table-container">
        <table className="table is-bordered is-fullwidth">
          <thead>
            <tr>
              <th>rolname</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              users
                .filter((user) => !search || user.rolname.includes(search))
                .map((user) => {
                  return (
                    <tr key={user.oid}>
                      <td>{user.rolname}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function App() {
  return (
    <>
      <section className="hero is-small">
        <div className="hero-body">
          <div className="container">
            <p className="title">VDSLab DB Manager</p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2 className="title">Create Database</h2>
          <div className="box">
            <DatabaseCreateForm />
          </div>
          <h2 className="title">Databases</h2>
          <div className="box">
            <DatabaseList />
          </div>
          <h2 className="title">Users</h2>
          <div className="box">
            <UserList />
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="content has-text-centered">
          <p>&copy; 2024 Yosuke Onoue</p>
        </div>
      </footer>
    </>
  );
}
