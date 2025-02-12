import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { OnModuleInit } from '@nestjs/common';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {


  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to database');
  }

  create(createProductDto: CreateProductDto) {

    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalItems = await this.product.count({
      where: {
        available: true,
      },
    } );
    const lastPage = Math.ceil(totalItems / limit);

    const data = await this.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: {
        available: true,
      },
    });

    return {
      data,
      meta: {
        total: totalItems,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: {
        id,
        available: true,
      },
    });

    if (!product) {
      throw new RpcException({ message: `Product with id ${id} not found`, status: HttpStatus.NOT_FOUND });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    const { id: _, ...data } = updateProductDto;
    const updatedProduct = {
      ...product,
      ...data,
    };
    return this.product.update({
      where: { id },
      data: updatedProduct,
    });
  }

  async remove(id: number) {
    // await this.findOne(id);
    // return this.product.delete({
    //   where: { id },
    // });
    await this.findOne(id);
    const product = this.product.update({
      where: { id },
      data: { available: false },
    });
    return product;
  }

  async validateProduct(ids: number[]) {

    const uniqueIds = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: { id: { in: uniqueIds } },
    });

    if (products.length !== uniqueIds.length) {
      const missingIds = uniqueIds.filter(id => !products.some(product => product.id === id));
      throw new RpcException({ message: `Products with ids ${missingIds} not found`, status: HttpStatus.BAD_REQUEST });
    }

    return products;
  }
}


