import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Table from '@editorjs/table';
import {Dropdown} from 'bootstrap';
import './styles/app.scss';
import Api from './functions';

document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    app.content = await app.fetchContent();
    app.initEditor();
});

class App {
    /** @type {Array<HTMLAnchorElement>} */
    anchorPageArray;

    /** @type {Array} */
    content;

    /** @type {HTMLDivElement} */
    contextMenu;

    /** @type {HTMLDivElement|undefined} */
    clickedAnchorPage;

    /** @type {HTMLDivElement} */
    currentAnchorPage;

    /** @type {EditorJS} */
    editor;

    /** @type {string} */
    pageId;

    /** @type {HTMLInputElement} */
    pageTitle;

    /** @type {HTMLUListElement} */
    pagesList;

    constructor() {
        this.anchorPageArray = Array.from(document.querySelectorAll('.anchor-page'));
        this.pageId = window.location.href.split('/').pop();
        this.contextMenu = document.querySelector('.context-menu');
        this.currentAnchorPage = this.anchorPageArray.find(anchorPage => anchorPage.dataset.id === this.pageId);
        this.pageTitle =  document.querySelector('#page-title');
        this.pagesList = document.querySelector('.pages-list');

        this.anchorPageArray.forEach(anchorPage => {
            anchorPage.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e);
            });
        })

        document.querySelector('body').addEventListener('click', () => {
            this.contextMenu.classList.remove('visible');
        }, true);

        document.querySelector('#btn-add-page').addEventListener('click', async () => {
            await this.addPage();
        });

        document.querySelector('.btn-delete-page').addEventListener('click', async () => {
            await this.deletePage();
        });

        this.pageTitle.addEventListener('keyup', (e) =>{
            const value = e.currentTarget.value.length === 0 ? 'Sans titre' : e.currentTarget.value;
            this.currentAnchorPage.innerText = value;
            document.title = value;
        });

        this.enableDropdowns();

        window.addEventListener('beforeunload', async () => {
            const data = {
                content: (await this.editor.save()).blocks,
                title: this.pageTitle.value.length === 0 ? 'Sans titre' : this.pageTitle.value
            };

            await Api.patch(`/pages/${this.pageId}`, JSON.stringify(data));
        });
    }

    async addPage() {
        const pageId = (await Api.post('/pages')).id;

        const li = document.createElement('li');
        const a = document.createElement('a');

        a.classList.add('link-dark', 'd-inline-flex', 'text-decoration-none', 'rounded', 'anchor-page');
        a.dataset.id = pageId;
        a.href = `/${pageId}`;
        a.innerText = 'Sans titre';

        li.appendChild(a);
        this.pagesList.appendChild(li);
    }

    async deletePage() {
        const pageId = this.clickedAnchorPage.dataset.id;

        await Api.delete(`/pages/${pageId}`);

        if(pageId === this.pageId) {
            window.location.reload();
        }

        this.clickedAnchorPage.remove();
    }

    enableDropdowns() {
        const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
        [...dropdownElementList].map(dropdownToggleEl => new Dropdown(dropdownToggleEl));
    }

    async fetchContent() {
        return (await Api.get(`/pages/${this.pageId}`)).content;
    }

    initEditor() {
        this.editor = new EditorJS({
            holder: 'editor',
            data: {
                blocks: this.content
            },
            logLevel: 'ERROR',
            tools: {
                header: Header,
                list: List,
                table: Table,
            }
        });
    }

    showContextMenu(e) {
        this.contextMenu.style.top = `${e.clientY}px`;
        this.contextMenu.style.left = `${e.clientX}px`;
        this.contextMenu.classList.add('visible');
        this.clickedAnchorPage = e.target;
    }
}