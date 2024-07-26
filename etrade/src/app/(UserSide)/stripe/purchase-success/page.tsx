import { Button } from "@/components/ui/button"
import db from "@/db/db"
import { formatCurrency } from "@/lib/formatters"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

/**
 * Renders a success or error page based on the status of a payment intent.
 *
 * @param {Object} searchParams - An object containing the payment_intent parameter.
 * @param {string} searchParams.payment_intent - The ID of the payment intent.
 * @return {Promise<JSX.Element>} A React element representing the success or error page.
 */
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { payment_intent: string }
}) {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    searchParams.payment_intent
  )
  if (paymentIntent.metadata.productId == null) return notFound()

  const product = await db.product.findUnique({
    where: { id: paymentIntent.metadata.productId },
  })
  if (product == null) return notFound()

  const isSuccess = paymentIntent.status === "succeeded"

  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <h1 className="text-4xl font-bold">
        {isSuccess ? "Success!" : "Error!"}
      </h1>
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className="object-cover"
          />
        </div>
        <div>
          <div className="text-lg">
            {formatCurrency(product.priceInCents / 100)}
          </div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">
            {product.description}
          </div>
          <Button className="mt-4" size="lg" asChild>
            {isSuccess ? (
              <a
                href={`/products/download/${await createDownloadVerification(
                  product.id
                )}`}
              >
                Download
              </a>
            ) : (
              <Link href={`/products/${product.id}/purchase`}>Try Again</Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Creates a download verification for a product.
 *
 * @param {string} productId - The ID of the product.
 * @return {Promise<string>} A promise that resolves to the ID of the created download verification.
 */
async function createDownloadVerification(productId: string) {
  return (
    await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    })
  ).id
}