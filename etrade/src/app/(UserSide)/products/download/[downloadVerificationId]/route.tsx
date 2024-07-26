import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"

/**
 * Retrieves a file from the server based on a download verification ID.
 *
 * @param {NextRequest} req - The request object.
 * @param {{ params: { downloadVerificationId: string } }} - The parameters object.
 * @return {Promise<NextResponse>} A promise that resolves to a NextResponse object.
 */
export async function GET(
  req: NextRequest,
  {
    params: { downloadVerificationId },
  }: { params: { downloadVerificationId: string } }
) {
  const data = await db.downloadVerification.findUnique({
    where: { id: downloadVerificationId, expiresAt: { gt: new Date() } },
    select: { product: { select: { filePath: true, name: true } } },
  })

  if (data == null) {
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }

  const { size } = await fs.stat(data.product.filePath)
  const file = await fs.readFile(data.product.filePath)
  const extension = data.product.filePath.split(".").pop()

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  })
}