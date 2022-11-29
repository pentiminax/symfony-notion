class Api {
    /**
     * @param {string} url
     * @param body
     */
    static delete = async (url, body = null) => {
        const response = await fetch(url,{
            method: 'DELETE',
            body: body
        });

        return await response.json();
    }

    /**
     * @param {string} url
     */
    static get = async (url) => {
        const response = await fetch(url);

        return await response.json();
    }

    /**
     * @param {string} url
     * @param body
     */
    static patch = async (url, body = null) => {
        const response = await fetch(url, {
            method: 'PATCH',
            body: body
        });

        return await response.json();
    }


    /**
     * @param {string} url
     * @param body
     */
    static post = async (url, body = null) => {
        const response = await fetch(url, {
            method: 'POST',
            body: body
        });

        return await response.json();
    }
}

export default Api;