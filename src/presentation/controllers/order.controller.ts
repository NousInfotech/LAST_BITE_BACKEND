import { Request, Response } from "express";
import { OrderUseCase } from "../../application/use-cases/order.useCase.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { validate } from "../../utils/validation.js";
import { OrderCreateSchema, OrderVerifySchema, OrderStatusUpdateSchema, OrderFeedbackSchema } from "../validators/order.validator.js";
import { CustomRequest } from "../../domain/interfaces/utils.interface.js";

export const OrderController = {
    async createOrder(req: CustomRequest, res: Response) {
        const userId = req.userId
        console.log('Order creation request received:', {
            userId,
            body: req.body
        });
        
        const validated = validate(OrderCreateSchema, { ...req.body, userId }, res);
        if (!validated) return;
        
        console.log('Order creation validation passed, proceeding with order creation');
        
        return tryCatch(res, async () => {
            const { userId, restaurantId, items, orderNotes, location, deliveryFee } = validated;
            const order = await OrderUseCase.createOnlineOrder({
                userId,
                restaurantId,
                items,
                orderNotes,
                deliveryFee,
                location,
            });
            return sendResponse(res, HTTP.CREATED, "Razorpay Order created successfully", order);
        });
    },

    async verifyOrder(req: Request, res: Response) {
        const validated = validate(OrderVerifySchema, req.body, res);
        if (!validated) return;
        return tryCatch(res, async () => {
            const verifiedOrder = await OrderUseCase.verifyPaymentAndCreateOrder(validated)
            if (!verifiedOrder) return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Error in Order Creation")
            return sendResponse(res, HTTP.CREATED, "Order created successfully", verifiedOrder);
        })
    },

    async updateOrderStatus(req: CustomRequest, res: Response) {
        const { orderId } = req.params;
        const validated = validate(OrderStatusUpdateSchema, { ...req.body, orderId }, res);
        if (!validated) return;
        
        return tryCatch(res, async () => {
            const userId = req.userId;
            const martStoreAdminId = req.martStoreAdminId;
            const restaurantAdminId = req.restaurantAdminId;
            const role = req.role;

            // For mart store admins, verify they can update this order
            if (role === 'martStoreAdmin' && martStoreAdminId) {
                console.log('🔍 [ORDER CONTROLLER] Updating order status for mart store admin:', martStoreAdminId);
                
                // Get the admin data to find the associated mart store
                const { MartStoreAdminUseCase } = await import("../../application/use-cases/martStoreAdmin.useCase.js");
                const admin = await MartStoreAdminUseCase.getAdminById(martStoreAdminId);
                
                if (!admin) {
                    return sendError(res, HTTP.NOT_FOUND, "Mart store admin not found");
                }

                if (!admin.martStoreId) {
                    return sendError(res, HTTP.NOT_FOUND, "No mart store associated with this admin");
                }

                // Verify the order belongs to this mart store
                const martStoreOrders = await MartStoreAdminUseCase.getMartStoreOrders(admin.martStoreId);
                const orderExists = martStoreOrders.some((order: any) => order.orderId === orderId);
                
                if (!orderExists) {
                    return sendError(res, HTTP.FORBIDDEN, "Order does not belong to this mart store");
                }
            } 
            // For restaurant admins, verify they can update this order
            else if (role === 'restaurantAdmin' && restaurantAdminId) {
                console.log('🔍 [ORDER CONTROLLER] Updating order status for restaurant admin:', restaurantAdminId);
                
                // Get the admin data to find the associated restaurant
                const { RestaurantAdminUseCase } = await import("../../application/use-cases/restaurantAdmin.useCase.js");
                const admin = await RestaurantAdminUseCase.getAdminById(restaurantAdminId);
                
                if (!admin) {
                    return sendError(res, HTTP.NOT_FOUND, "Restaurant admin not found");
                }

                if (!admin.restaurantId) {
                    return sendError(res, HTTP.NOT_FOUND, "No restaurant associated with this admin");
                }

                // Verify the order belongs to this restaurant
                const restaurantOrders = await OrderUseCase.getRestaurantOrders(admin.restaurantId);
                const orderExists = restaurantOrders.some((order: any) => order.orderId === orderId);
                
                if (!orderExists) {
                    return sendError(res, HTTP.FORBIDDEN, "Order does not belong to this restaurant");
                }
            } else if (!userId) {
                return sendError(res, HTTP.UNAUTHORIZED, "User ID, Mart Store Admin ID, or Restaurant Admin ID not found in request");
            }

            const updatedOrder = await OrderUseCase.updateOrderStatus(orderId, validated.status);
            if (!updatedOrder) return sendError(res, HTTP.NOT_FOUND, "Order not found or status not updated");
            return sendResponse(res, HTTP.OK, "Order status updated", updatedOrder);
        });
    },

    async getUserOrders(req: CustomRequest, res: Response) {
        return tryCatch(res, async () => {
            const userId = req.userId;
            const martStoreAdminId = req.martStoreAdminId;
            const restaurantAdminId = req.restaurantAdminId;
            const role = req.role;

            if (!userId && !martStoreAdminId && !restaurantAdminId) {
                return sendError(res, HTTP.UNAUTHORIZED, "User ID, Mart Store Admin ID, or Restaurant Admin ID not found in request");
            }

            let orders;
            if (role === 'martStoreAdmin' && martStoreAdminId) {
                // For mart store admin, get orders for their mart store
                console.log('🔍 [ORDER CONTROLLER] Getting orders for mart store admin:', martStoreAdminId);
                
                // Get the admin data to find the associated mart store
                const { MartStoreAdminUseCase } = await import("../../application/use-cases/martStoreAdmin.useCase.js");
                const admin = await MartStoreAdminUseCase.getAdminById(martStoreAdminId);
                
                if (!admin) {
                    return sendError(res, HTTP.NOT_FOUND, "Mart store admin not found");
                }

                if (!admin.martStoreId) {
                    return sendError(res, HTTP.NOT_FOUND, "No mart store associated with this admin");
                }

                console.log('🔍 [ORDER CONTROLLER] Getting orders for mart store:', admin.martStoreId);
                orders = await MartStoreAdminUseCase.getMartStoreOrders(admin.martStoreId);
            } else if (role === 'restaurantAdmin' && restaurantAdminId) {
                // For restaurant admin, get orders for their restaurant
                console.log('🔍 [ORDER CONTROLLER] Getting orders for restaurant admin:', restaurantAdminId);
                
                // Get the admin data to find the associated restaurant
                const { RestaurantAdminUseCase } = await import("../../application/use-cases/restaurantAdmin.useCase.js");
                const admin = await RestaurantAdminUseCase.getAdminById(restaurantAdminId);
                
                if (!admin) {
                    return sendError(res, HTTP.NOT_FOUND, "Restaurant admin not found");
                }

                if (!admin.restaurantId) {
                    return sendError(res, HTTP.NOT_FOUND, "No restaurant associated with this admin");
                }

                console.log('🔍 [ORDER CONTROLLER] Getting orders for restaurant:', admin.restaurantId);
                orders = await OrderUseCase.getRestaurantOrders(admin.restaurantId);
            } else if (userId) {
                // For regular users, get their orders
                console.log('🔍 [ORDER CONTROLLER] Getting orders for user:', userId);
                orders = await OrderUseCase.getUserOrders(userId);
            } else {
                return sendError(res, HTTP.UNAUTHORIZED, "Invalid user or admin ID");
            }

            return sendResponse(res, HTTP.OK, "Orders fetched successfully", { orders });
        });
    },

    async getUserPastOrders(req: CustomRequest, res: Response) {
        return tryCatch(res, async () => {
            const userId = req.userId;
            const martStoreAdminId = req.martStoreAdminId;
            const restaurantAdminId = req.restaurantAdminId;
            const role = req.role;

            if (!userId && !martStoreAdminId && !restaurantAdminId) {
                return sendError(res, HTTP.UNAUTHORIZED, "User ID, Mart Store Admin ID, or Restaurant Admin ID not found in request");
            }

            let orders;
            if (role === 'martStoreAdmin' && martStoreAdminId) {
                // For mart store admin, get past orders for their mart store
                console.log('🔍 [ORDER CONTROLLER] Getting past orders for mart store admin:', martStoreAdminId);
                
                // Get the admin data to find the associated mart store
                const { MartStoreAdminUseCase } = await import("../../application/use-cases/martStoreAdmin.useCase.js");
                const admin = await MartStoreAdminUseCase.getAdminById(martStoreAdminId);
                
                if (!admin) {
                    return sendError(res, HTTP.NOT_FOUND, "Mart store admin not found");
                }

                if (!admin.martStoreId) {
                    return sendError(res, HTTP.NOT_FOUND, "No mart store associated with this admin");
                }

                console.log('🔍 [ORDER CONTROLLER] Getting past orders for mart store:', admin.martStoreId);
                const allOrders = await MartStoreAdminUseCase.getMartStoreOrders(admin.martStoreId);
                // Filter for past orders (delivered or cancelled)
                orders = allOrders.filter((order: any) => 
                    order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED'
                );
            } else if (role === 'restaurantAdmin' && restaurantAdminId) {
                // For restaurant admin, get past orders for their restaurant
                console.log('🔍 [ORDER CONTROLLER] Getting past orders for restaurant admin:', restaurantAdminId);
                
                // Get the admin data to find the associated restaurant
                const { RestaurantAdminUseCase } = await import("../../application/use-cases/restaurantAdmin.useCase.js");
                const admin = await RestaurantAdminUseCase.getAdminById(restaurantAdminId);
                
                if (!admin) {
                    return sendError(res, HTTP.NOT_FOUND, "Restaurant admin not found");
                }

                if (!admin.restaurantId) {
                    return sendError(res, HTTP.NOT_FOUND, "No restaurant associated with this admin");
                }

                console.log('🔍 [ORDER CONTROLLER] Getting past orders for restaurant:', admin.restaurantId);
                const allOrders = await OrderUseCase.getRestaurantOrders(admin.restaurantId);
                // Filter for past orders (delivered or cancelled)
                orders = allOrders.filter((order: any) => 
                    order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED'
                );
            } else if (userId) {
                // For regular users, get their past orders
                console.log('🔍 [ORDER CONTROLLER] Getting past orders for user:', userId);
                orders = await OrderUseCase.getUserPastOrders(userId);
            } else {
                return sendError(res, HTTP.UNAUTHORIZED, "Invalid user or admin ID");
            }

            return sendResponse(res, HTTP.OK, "Past orders fetched successfully", { orders });
        });
    },
    async orderFeeback(req: CustomRequest, res: Response) {
        const { orderId } = req.params;
        const validated = validate(OrderFeedbackSchema, req.body, res);
        if (!validated) return;
        
        return tryCatch(res, async () => {
            const userId = req.userId;
            const martStoreAdminId = req.martStoreAdminId;
            const restaurantAdminId = req.restaurantAdminId;
            const role = req.role;

            // For mart store admins, verify they can update this order
            if (role === 'martStoreAdmin' && martStoreAdminId) {
                console.log('🔍 [ORDER CONTROLLER] Adding feedback for mart store admin:', martStoreAdminId);
                
                // Get the admin data to find the associated mart store
                const { MartStoreAdminUseCase } = await import("../../application/use-cases/martStoreAdmin.useCase.js");
                const admin = await MartStoreAdminUseCase.getAdminById(martStoreAdminId);
                
                if (!admin) {
                    return sendError(res, HTTP.NOT_FOUND, "Mart store admin not found");
                }

                if (!admin.martStoreId) {
                    return sendError(res, HTTP.NOT_FOUND, "No mart store associated with this admin");
                }

                // Verify the order belongs to this mart store
                const martStoreOrders = await MartStoreAdminUseCase.getMartStoreOrders(admin.martStoreId);
                const orderExists = martStoreOrders.some((order: any) => order.orderId === orderId);
                
                if (!orderExists) {
                    return sendError(res, HTTP.FORBIDDEN, "Order does not belong to this mart store");
                }
            } 
            // For restaurant admins, verify they can update this order
            else if (role === 'restaurantAdmin' && restaurantAdminId) {
                console.log('🔍 [ORDER CONTROLLER] Adding feedback for restaurant admin:', restaurantAdminId);
                
                // Get the admin data to find the associated restaurant
                const { RestaurantAdminUseCase } = await import("../../application/use-cases/restaurantAdmin.useCase.js");
                const admin = await RestaurantAdminUseCase.getAdminById(restaurantAdminId);
                
                if (!admin) {
                    return sendError(res, HTTP.NOT_FOUND, "Restaurant admin not found");
                }

                if (!admin.restaurantId) {
                    return sendError(res, HTTP.NOT_FOUND, "No restaurant associated with this admin");
                }

                // Verify the order belongs to this restaurant
                const restaurantOrders = await OrderUseCase.getRestaurantOrders(admin.restaurantId);
                const orderExists = restaurantOrders.some((order: any) => order.orderId === orderId);
                
                if (!orderExists) {
                    return sendError(res, HTTP.FORBIDDEN, "Order does not belong to this restaurant");
                }
            } else if (!userId) {
                return sendError(res, HTTP.UNAUTHORIZED, "User ID, Mart Store Admin ID, or Restaurant Admin ID not found in request");
            }

            const feedback = await OrderUseCase.customerFeedback(orderId, validated);
            if (!feedback) return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Error in updating feedback");
            return sendResponse(res, HTTP.OK, "Feedback updated successfully", feedback);
        });
    }
};
