import { GetStaticPathsResult, GetStaticPropsResult } from "next"
import Head from "next/head"
import { DrupalNode } from "next-drupal"
import { drupal } from "lib/drupal"
import { NodeArticle } from "components/node--article"
import { NodeBasicPage } from "components/node--basic-page"
import { Layout } from "components/layout"
import { useRouter } from "next/router"

const RESOURCE_TYPES = ["node--page", "node--article"]

interface NodePageProps {
  resource: DrupalNode
}

export default function NodePage({ resource }: NodePageProps) {
  const router = useRouter()

  if (!resource) return null

  return (
    <Layout>
      <Head>
        <title>{resource.title}</title>
        <meta name="description" content="A Next.js site powered by Drupal." />
      </Head>

      {resource.type === "node--page" && <NodeBasicPage node={resource} />}
      {resource.type === "node--article" && <NodeArticle node={resource} />}

      {/* Ajouter le bouton Retour ici */}
      <button
        onClick={() => router.back()}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: 'gray',
          color: 'white',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
        }}
      >
        Retour
      </button>
    </Layout>
  )
}

export async function getStaticPaths(context): Promise<GetStaticPathsResult> {
  return {
    paths: await drupal.getStaticPathsFromContext(RESOURCE_TYPES, context),
    fallback: "blocking",
  }
}

export async function getStaticProps(
  context
): Promise<GetStaticPropsResult<NodePageProps>> {
  const path = await drupal.translatePathFromContext(context)

  if (!path) {
    return {
      notFound: true,
    }
  }

  const type = path.jsonapi.resourceName

  let params = {}
  if (type === "node--article") {
    params = {
      include: "field_image,uid",
    }
  }

  const resource = await drupal.getResourceFromContext<DrupalNode>(
    path,
    context,
    {
      params,
    }
  )

  if (!resource) {
    throw new Error(`Failed to fetch resource: ${path.jsonapi.individual}`)
  }

  if (!context.preview && resource?.status === false) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      resource,
    },
  }
}
