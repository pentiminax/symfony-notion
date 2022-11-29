<?php

namespace App\Controller;

use App\Entity\Page;
use App\Repository\PageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('IS_AUTHENTICATED_FULLY')]
class PageController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    )
    {
    }

    #[Route('/{id?}', name: 'app_page', methods: ['GET'])]
    public function index(?Page $page, PageRepository $pageRepo): Response
    {
        if ($page && $page->getOwner() !== $this->getUser()) {
            return $this->redirectToRoute('app_page');
        }

        if (!$page) {
            $page = new Page($this->getUser());

            $this->em->persist($page);
            $this->em->flush();

            return $this->redirectToRoute('app_page', [
                'id' => $page->getId()
            ]);
        }

        return $this->render('page/index.html.twig', [
            'currentPage' => $page,
            'pages' => $pageRepo->findByOwnerOrderedByCreatedAt($this->getUser())
        ]);
    }

    #[Route('/pages', name: 'app_page_add', methods: ['POST'])]
    public function add(): Response
    {
        $page = new Page($this->getUser());

        $this->em->persist($page);
        $this->em->flush();

        return $this->json([
            'id' => $page->getId()
        ]);
    }

    #[Route('/pages/{id}', name: 'app_page_update', methods: ['GET', 'PATCH'])]
    public function update(?Page $page, Request $request): Response
    {
        if (!$page) {
            return $this->json([], Response::HTTP_NOT_FOUND);
        }

        if ($request->isMethod(Request::METHOD_PATCH)) {
            $content = json_decode($request->getContent(), true);

            if(isset($content['content'])) {
                $page->setContent(json_encode($content['content']));
            }

            if(isset($content['title'])) {
                $page->setTitle($content['title']);
            }

            $this->em->flush();
        }


        return $this->json([
            'title' => $page->getTitle(),
            'content' => json_decode($page->getContent())
        ]);
    }

    #[Route('/pages/{id}', name: 'app_page_delete', methods: ['DELETE'])]
    public function delete(?Page $page): Response
    {
        if (!$page) {
            return $this->json([], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($page);
        $this->em->flush();

        return $this->json([
            'error' => false,
            'result' => null
        ]);
    }
}
