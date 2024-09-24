import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router"; // Importer useRouter pour la navigation
import { DrupalNode } from "next-drupal";
import { drupal } from "lib/drupal";
import { Layout } from "components/layout";
import { NodeArticle } from "components/node--article";

interface ArticlePageProps {
  node: DrupalNode;
}

export default function ArticlePage({ node }: ArticlePageProps) {
  const router = useRouter(); // Utiliser useRouter pour la navigation

  return (
    <Layout>
      <h1>{node.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: node.body.processed }} />

      {/* Bouton pour revenir à l'accueil */}
      <button
        onClick={() => router.push("/")}
        className="mt-5 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Retour à l'accueil
      </button>
    </Layout>
  );
}

// Génération des chemins dynamiques pour chaque article
export const getStaticPaths: GetStaticPaths = async () => {
  const nodes = await drupal.getResourceCollection<DrupalNode[]>("node--article");

  const paths = nodes.map((node) => ({
    params: {
      id: node.id,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

// Récupération des données d'un article spécifique
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const node = await drupal.getResource<DrupalNode>("node--article", params.id as string);

  return {
    props: {
      node,
    },
  };
};
