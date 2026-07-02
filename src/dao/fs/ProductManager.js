import fs from 'fs';
import path from 'path';

export default class ProductManager {
    constructor(filePath) {
        this.path = filePath || path.join(process.cwd(), 'src/dao/fs/data/products.json');
        this.init();
    }

    async init() {
        if (!fs.existsSync(path.dirname(this.path))) {
            fs.mkdirSync(path.dirname(this.path), { recursive: true });
        }
        if (!fs.existsSync(this.path)) {
            await fs.promises.writeFile(this.path, JSON.stringify([]));
        }
    }

    async getProductsRaw() {
        const data = await fs.promises.readFile(this.path, 'utf-8');
        return JSON.parse(data);
    }

    async getProducts(limit = 10, page = 1, sort, query) {
        try {
            let products = await this.getProductsRaw();

            if (query) {
                if (query === 'true' || query === 'false') {
                    const statusVal = query === 'true';
                    products = products.filter(p => p.status === statusVal);
                } else {
                    products = products.filter(p => p.category && p.category.toLowerCase() === query.toLowerCase());
                }
            }

            if (sort) {
                if (sort === 'asc') {
                    products.sort((a, b) => a.price - b.price);
                } else if (sort === 'desc') {
                    products.sort((a, b) => b.price - a.price);
                }
            }

            limit = parseInt(limit, 10);
            page = parseInt(page, 10);
            const totalProducts = products.length;
            const totalPages = Math.ceil(totalProducts / limit) || 1;
            const currentPage = page > totalPages ? totalPages : (page < 1 ? 1 : page);

            const startIndex = (currentPage - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedProducts = products.slice(startIndex, endIndex);

            const hasPrevPage = currentPage > 1;
            const hasNextPage = currentPage < totalPages;
            const prevPage = hasPrevPage ? currentPage - 1 : null;
            const nextPage = hasNextPage ? currentPage + 1 : null;

            return {
                status: 'success',
                payload: paginatedProducts,
                totalPages,
                prevPage,
                nextPage,
                page: currentPage,
                hasPrevPage,
                hasNextPage,
                prevLink: hasPrevPage ? `/api/products?page=${prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
                nextLink: hasNextPage ? `/api/products?page=${nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null
            };
        } catch (error) {
            console.error('Error in getProducts FS:', error);
            throw new Error('Could not fetch products');
        }
    }

    async getProductById(id) {
        const products = await this.getProductsRaw();
        const product = products.find(p => p.id === id || p.id.toString() === id.toString());
        if (!product) throw new Error('Product not found');
        return product;
    }

    async addProduct(product) {
        const products = await this.getProductsRaw();
        product.id = products.length ? products[products.length - 1].id + 1 : 1;
        if (product.status === undefined) product.status = true;
        if (!product.thumbnails) product.thumbnails = [];
        products.push(product);
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return product;
    }

    async updateProduct(id, updatedFields) {
        const products = await this.getProductsRaw();
        const index = products.findIndex(p => p.id === id || p.id.toString() === id.toString());
        if (index === -1) throw new Error('Product not found');
        
        if (updatedFields.id) delete updatedFields.id;
        if (updatedFields._id) delete updatedFields._id;

        products[index] = { ...products[index], ...updatedFields };
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.getProductsRaw();
        const index = products.findIndex(p => p.id === id || p.id.toString() === id.toString());
        if (index === -1) throw new Error('Product not found');
        
        const deletedProduct = products[index];
        const filtered = products.filter((_, idx) => idx !== index);
        await fs.promises.writeFile(this.path, JSON.stringify(filtered, null, 2));
        return deletedProduct;
    }
}
