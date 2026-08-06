
# 💡 AI Prompt: Integrate a Node.js (JavaScript) Project with Local PostgreSQL and Drizzle ORM

**Role:** You are an expert software agent responsible for configuring the current Node.js (JavaScript) project to connect to a local PostgreSQL database using Drizzle ORM.

**Purpose:** To install the necessary packages, configure Drizzle Kit for migrations, define a database schema in JavaScript, and provide a working script that demonstrates a full CRUD (Create, Read, Update, Delete) lifecycle.

**Scope:**

* Assumes the user is working within a Node.js project directory.
* Assumes PostgreSQL is installed and running locally on the user's machine.
* Assumes the user has created (or will create) a local PostgreSQL database.

✅ Read and understand the entire instruction set before executing.

---

## 🛠️ Instructions (for AI-enabled editors)

When this prompt is triggered, automatically configure the open Node.js project as follows:

Detect the package manager used in this project (`npm`, `yarn`, `pnpm`, `bun`, etc.). Use it for all subsequent package management and script execution commands. The following instructions assume `npm`, but adapt commands as necessary for the detected package manager.

### 1. Initialize Project

1. Check if a `package.json` file exists. If not, create one by running:
```bash
npm init -y

```


2. Ensure the `package.json` file is configured for ES Modules by adding `"type": "module"`.

---

### 2. Install Dependencies

Install the required production and development dependencies for JavaScript:

```bash
npm install drizzle-orm pg dotenv
npm install -D drizzle-kit

```

---

### 3. Configure Environment

1. Check whether a `.env` file exists in the project root. If not, create one.
2. Ask the user for their local PostgreSQL connection details if not already available:
* Username (default: `postgres`)
* Password
* Host (default: `localhost`)
* Port (default: `5432`)
* Database name


3. Create or update `.env` with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

```


*Example:*
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/drizzle_demo"

```



---

### 4. Create Drizzle Configuration

Create a `drizzle.config.js` file in the project root:

```javascript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

export default defineConfig({
  schema: './src/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

```

---

### 5. Define Database Schema

Create `src/schema.js`:

```javascript
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'demo_users' table
export const demoUsers = pgTable('demo_users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

```

---

### 6. Create Database Client

Create `src/db.js`:

```javascript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env');
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

```

---

### 7. Create CRUD Example Script

Create `src/index.js`:

```javascript
import { eq } from 'drizzle-orm';
import { db, pool } from './db.js';
import { demoUsers } from './schema.js';

async function main() {
  try {
    console.log('Running CRUD operations on local PostgreSQL...\n');

    // CREATE: Insert a new user
    const [newUser] = await db
      .insert(demoUsers)
      .values({ name: 'Admin User', email: 'admin@example.com' })
      .returning();

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    console.log('✅ CREATE: New user created:', newUser);

    // READ: Select the user
    const foundUsers = await db
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.id, newUser.id));

    console.log('✅ READ: Found user:', foundUsers[0]);

    // UPDATE: Change the user's name
    const [updatedUser] = await db
      .update(demoUsers)
      .set({ name: 'Super Admin' })
      .where(eq(demoUsers.id, newUser.id))
      .returning();

    console.log('✅ UPDATE: User updated:', updatedUser);

    // DELETE: Remove the user
    await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log('✅ DELETE: User deleted.');

    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    // Gracefully close the connection pool
    await pool.end();
    console.log('Database pool closed.');
  }
}

main();

```

---

### 8. Add Scripts to `package.json`

Update the `scripts` section in `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "start": "node src/index.js"
  }
}

```

---

## 🚀 Next Steps

Before running the scripts, ensure:

1. PostgreSQL is installed and the local service is running.
2. The target database exists in your local PostgreSQL server.
3. `.env` contains valid connection credentials.

Generate migration files:

```bash
npm run db:generate

```

Push schema directly or apply migrations:

```bash
npm run db:push

```

Run the CRUD script using Node.js:

```bash
npm start

```

---

## ✅ Validation Rules for AI

Before providing code or making changes, ensure:

* All created files use `.js` extension (no `.ts` or TypeScript configs).
* ES Modules syntax (`import`/`export`) is used, and `"type": "module"` is in `package.json`.
* The database driver is `pg` (`node-postgres`).
* `drizzle.config.js` correctly references `.js` schema files.
* All file imports in code explicitly use the `.js` extension (e.g., `import { db } from './db.js'`).
* The `pg.Pool` connection is cleanly closed in the `finally` block using `await pool.end()`.

---

## ❌ Do Not

* Do not include TypeScript packages (`typescript`, `tsx`, `@types/*`).
* Do not hardcode database credentials inside JavaScript code.
* Do not forget file extensions in relative imports (Node.js ES Modules require explicit `.js` extensions).