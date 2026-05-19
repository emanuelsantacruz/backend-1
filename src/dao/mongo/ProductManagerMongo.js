import { productModel } from '../../models/product.model.js';

export default class ProductManagerMongo {
    async getProducts(limit = 10, page = 1, sort, query) {
        try {
            const filter = {};
            if (query) {

                if (query === 'true' || query === 'false') {
                    filter.status = query === 'true';
                } else {
                    filter.category = query;
                }
            }

            const options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                lean: true
            };

            if (sort) {
                options.sort = { price: sort === 'asc' ? 1 : -1 };
            }

            const result = await productModel.paginate(filter, options);
            return {
                status: 'success',
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
                nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null
            };
        } catch (error) {
            console.error('Error in getProducts:', error);
            throw new Error('Could not fetch products');
        }
    }

    async getProductById(id) {
        try {
            const product = await productModel.findById(id).lean();
            if (!product) throw new Error('Product not found');
            return product;
        } catch (error) {
            console.error('Error in getProductById:', error);
            throw new Error('Could not fetch product');
        }
    }

    async addProduct(productData) {
        try {
            const newProduct = await productModel.create(productData);
            return newProduct;
        } catch (error) {
            console.error('Error in addProduct:', error);
            throw new Error('Could not add product');
        }
    }

    async updateProduct(id, updateData) {
        try {
            if (updateData._id) delete updateData._id;
            
            const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });
            if (!updatedProduct) throw new Error('Product not found');
            return updatedProduct;
        } catch (error) {
            console.error('Error in updateProduct:', error);
            throw new Error('Could not update product');
        }
    }

    async deleteProduct(id) {
        try {
            const deletedProduct = await productModel.findByIdAndDelete(id);
            if (!deletedProduct) throw new Error('Product not found');
            return deletedProduct;
        } catch (error) {
            console.error('Error in deleteProduct:', error);
            throw new Error('Could not delete product');
        }
    }
}
