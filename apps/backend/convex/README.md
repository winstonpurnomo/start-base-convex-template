# Welcome to your Convex functions directory!

Write your Convex functions here.
See https://docs.convex.dev/functions for more.

A query function that takes two arguments looks like:

```ts
// convex/myFunctions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQueryFunction = query({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Read the database as many times as you need here.
    // See https://docs.convex.dev/database/reading-data.
    const documents = await ctx.db.query("tablename").collect();

    // Arguments passed from the client are properties of the args object.
    console.log(args.first, args.second);

    // Write arbitrary JavaScript here: filter, aggregate, build derived data,
    // remove non-public properties, or create new objects.
    return documents;
  },
});
```

Using this query function in a React component looks like:

```ts
const data = useQuery(api.myFunctions.myQueryFunction, {
  first: 10,
  second: "hello",
});
```

A mutation function looks like:

```ts
// convex/myFunctions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  // Validators for arguments.
  args: {
    first: v.string(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.
    const message = { body: args.first, author: args.second };
    const id = await ctx.db.insert("messages", message);

    // Optionally, return a value from your mutation.
    return await ctx.db.get("messages", id);
  },
});
```

Using this mutation function in a React component looks like:

```ts
const mutation = useMutation(api.myFunctions.myMutationFunction);
function handleButtonPress() {
  // fire and forget, the most common way to use mutations
  mutation({ first: "Hello!", second: "me" });
  // OR
  // use the result once the mutation has completed
  mutation({ first: "Hello!", second: "me" }).then((result) =>
    console.log(result)
  );
}
```

Use the Convex CLI to push your functions to a deployment. See everything
the Convex CLI can do by running `npx convex -h` in your project root
directory. To learn more, launch the docs with `npx convex docs`.

# Cross-Component Queries in Convex

In Convex, components run in their own sandbox with their own functions,
schema, and data. When you want to query data across the component boundary
(i.e., from your app into a component, or from a component back into the app),
there are a few important things to know:

## Calling Component Queries from Your App

You can call a component's query functions from your app using ctx.runQuery
with the components object:

```ts
import { internalAction } from "./_generated/server";
import { components } from "./_generated/api";

export const myAction = internalAction({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const { status } = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: args.threadId,
    });
  },
});
```

## Rules That Apply

The same Convex function rules apply across the component boundary:

- Queries can only call component queries
- Mutations can also call component mutations
- Actions can also call component actions

This means queries into components are reactive by default, and mutations have
the same transaction guarantees.

Return Type Inference
If a function in a component is called from outside the component, the return
type won't be inferred unless a returns validator is provided on the component
function:

```ts
export const someFunction = query({
  args: { sessionId: v.id("session") },
  returns: v.union(v.null(), doc(schema, "session")), // needed for type inference
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});
```

## ID Validation Across Components

Because each component has its own namespaced database, `v.id("tableName")`
does not work across the component boundary. If you need to reference an ID
from a component's table in your app's schema, you must use v.string() instead.

## Internal Functions in Components

Note that internal functions defined in a component are not accessible from
outside the component. Only public functions exported by a component can be
called from the parent app — and importantly, these public functions are never
exposed to the internet, even though they are public.

## Schema Isolation

**Do not** import or spread table definitions from a component's schema into
the app's top-level `schema.ts`. Each component (e.g. `betterAuth`) owns its
own schema and manages its own tables in an isolated namespace. Merging them
will not add the data from sub-components into the main app.

Concretely, this is **wrong**:

```ts
// convex/schema.ts — DO NOT DO THIS
import { tables } from "./betterAuth/schema.gen"; // ❌

export default defineSchema({
  ...tables, // ❌ spreads component tables into the app schema
});
```

The app's `schema.ts` should only define tables that belong to the app itself.
Component schemas (like `convex/betterAuth/schema.ts`) are self-contained and
are only used internally by their component. If you need to reference a
document ID from a component table, use `v.string()` rather than
`v.id("tableName")` (see ID Validation section above).

## Performance Consideration

Each call to a component is currently a fresh invocation. Multiple ctx.runQuery
calls to the same component will each be separate transactions and are not
guaranteed to be consistent with each other. It's best to batch database access
into a single query where possible.

# Migrating Data

Convex handles schema migrations differently from traditional SQL databases —
you don't write explicit "add column" or "drop column" queries. Instead, you
update your schema.ts file and Convex enforces it. Convex will not let you
deploy a schema that doesn't match the data at rest. As such, to change schemas
in ways which do not match the data at rest, we typically do a three-step
process:

1. Modify `schema.ts` in a non-breaking, partial update - adding a field that you plan to make required? Add it as optional first. Removing a field? Mark it as optional.
2. Define an `internalMutation` that will modify the existing data in the desired way, then use `convex run` in the CLI to run it.
3. Make the previously breaking change in `schema.ts`.
