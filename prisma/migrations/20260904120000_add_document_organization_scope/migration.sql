-- Add an organization scope for documents. Nullable keeps existing legacy records intact.
ALTER TABLE "Document" ADD COLUMN "organizationId" TEXT;

CREATE INDEX "Document_organizationId_idx" ON "Document"("organizationId");
