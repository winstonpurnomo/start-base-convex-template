import {
  customAction,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import type { Customization } from "convex-helpers/server/customFunctions";
import type { GenericDataModel, GenericQueryCtx } from "convex/server";
import { v } from "convex/values";
import { createLogger } from "evlog";

import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

interface OrgSession {
  id: string;
  userId: string;
  activeOrganizationId: string;
}

interface OrgUser {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null | undefined;
}

interface OrgAuthContext {
  session: OrgSession;
  user: OrgUser;
}

type OrgLoggedContext = OrgAuthContext & {
  logger: ReturnType<typeof createLogger>;
};

type CtxWithRunQuery<DataModel extends GenericDataModel = GenericDataModel> =
  Pick<GenericQueryCtx<DataModel>, "runQuery">;

const orgLoggedArgs = {
  _path: v.optional(v.string()),
};

const getOrgAuthContext = async <Ctx extends CtxWithRunQuery>(
  ctx: Ctx
): Promise<OrgAuthContext> => {
  const data = await ctx.runQuery(api.auth.getSession, {});
  if (!data || !data.session || !data.user) {
    throw new Error("Not authenticated");
  }

  if (!data.session.activeOrganizationId) {
    throw new Error("Not authenticated with an active organization");
  }

  const { activeOrganizationId } = data.session;
  return {
    session: {
      ...data.session,
      activeOrganizationId,
    },
    user: data.user,
  };
};

const createOrgLoggedInput =
  <Ctx extends CtxWithRunQuery>(
    method: "GET" | "POST"
  ): Customization<
    Ctx,
    typeof orgLoggedArgs,
    OrgLoggedContext,
    Record<string, never>
  >["input"] =>
  async (ctx, args) => {
    const logger = createLogger({
      method,
      path: args._path,
    });
    const result = await getOrgAuthContext(ctx);

    return {
      ctx: {
        logger,
        ...result,
      },
      args: {},
      onSuccess: () => {
        logger.set({
          status: 200,
        });
        logger.emit();
      },
      onError: (err: unknown) => {
        logger.set({ status: 500, error: err });
        logger.emit();
      },
    };
  };

export const orgAuthedMutation = customMutation(mutation, {
  args: orgLoggedArgs,
  input: createOrgLoggedInput("POST"),
});

export const orgAuthedQuery = customQuery(query, {
  args: orgLoggedArgs,
  input: createOrgLoggedInput("GET"),
});

export const orgAuthedAction = customAction(action, {
  args: orgLoggedArgs,
  input: createOrgLoggedInput("POST"),
});

export class UnauthorizedError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}
