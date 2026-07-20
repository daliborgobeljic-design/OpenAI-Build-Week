import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(), tenantId: text("tenant_id").notNull(), name: text("name").notNull(), version: text("version").notNull(),
}, t=>[uniqueIndex("products_tenant_id_id").on(t.tenantId,t.id)]);

export const artifacts = sqliteTable("artifacts", {
  id:text("id").primaryKey(), tenantId:text("tenant_id").notNull(), productId:text("product_id").notNull(), objectKey:text("object_key").notNull(), sha256:text("sha256").notNull(), createdAt:text("created_at").notNull(),
});

export const suggestions = sqliteTable("suggestions", {
  id:text("id").primaryKey(), tenantId:text("tenant_id").notNull(), productId:text("product_id").notNull(), sourceFragmentId:text("source_fragment_id").notNull(), proposedValue:text("proposed_value").notNull(), status:text("status").notNull().default("SUGGESTED"), modelRunId:text("model_run_id"), createdAt:text("created_at").notNull(),
});

export const approvals = sqliteTable("approvals", {
  id:text("id").primaryKey(), tenantId:text("tenant_id").notNull(), suggestionId:text("suggestion_id").notNull(), reviewerId:text("reviewer_id").notNull(), createdAt:text("created_at").notNull(),
});

export const auditEvents = sqliteTable("audit_events", {
  id:text("id").primaryKey(), tenantId:text("tenant_id").notNull(), eventType:text("event_type").notNull(), actorId:text("actor_id").notNull(), payloadJson:text("payload_json").notNull(), previousHash:text("previous_hash"), eventHash:text("event_hash").notNull(), sequence:integer("sequence").notNull(), createdAt:text("created_at").notNull(),
});

export const aiRateLimits = sqliteTable("ai_rate_limits", {
  tenantId:text("tenant_id").notNull(), actorId:text("actor_id").notNull(), useCase:text("use_case").notNull(), windowStart:text("window_start").notNull(), calls:integer("calls").notNull().default(0),
}, t=>[uniqueIndex("ai_rate_limits_window").on(t.tenantId,t.actorId,t.useCase,t.windowStart)]);
