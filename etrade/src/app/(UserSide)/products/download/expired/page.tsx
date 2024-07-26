import { Button } from "@/components/ui/button"
import Link from "next/link"

/**
 * Renders a component to display a message indicating that the download link has expired.
 *
 * @return {JSX.Element} The JSX element representing the expired download component.
 */
export default function Expired() {
  return (
    <>
      <h1 className="text-4xl mb-4">Download link expired</h1>
      <Button asChild size="lg">
        <Link href="/orders">Get New Link</Link>
      </Button>
    </>
  )
}