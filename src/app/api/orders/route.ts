import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import jwt from "jsonwebtoken";

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const token = req.cookies.get("velora-token")?.value;
    if (!token) return null;
    const payload = jwt.verify(token, process.env.JWT_SECRET || "velora-jwt-secret") as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, subtotal, shipping, total, paymentMethod, addressId, notes, couponCode, discount } = body;

    const orderNumber = generateOrderNumber();
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión para realizar un pedido" }, { status: 401 });
    }

    // Validate coupon and get its id if provided
    let couponId: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
      if (coupon && coupon.isActive) {
        couponId = coupon.id;
      }
    }

    // Reducir stock de cada producto
    await Promise.all(
      items.map((item: any) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
        })
      )
    );

    // Snapshot address data so it's always available in admin even if address is later deleted
    let shippingAddress: Record<string, string> | null = null;
    if (addressId) {
      const addr = await prisma.address.findUnique({ where: { id: addressId } });
      if (addr) {
        shippingAddress = {
          name: addr.name, phone: addr.phone, street: addr.street,
          city: addr.city, state: addr.state, zipCode: addr.zipCode, country: addr.country,
        };
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        shipping,
        discount: discount ?? 0,
        total,
        paymentMethod,
        notes,
        ...(addressId ? { addressId } : {}),
        ...(shippingAddress ? { shippingAddress } : {}),
        ...(couponId ? { couponId } : {}),
        status: "CONFIRMED",
        paymentStatus: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            size: item.size,
            subtotal: item.price * item.quantity,
          })),
        },
      },
    });

    // Increment coupon usage count
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Enviar email de confirmación de pedido
    if (process.env.RESEND_API_KEY) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
      if (user) {
        const { sendOrderConfirmationEmail } = await import("@/lib/resend");
        sendOrderConfirmationEmail(
          user.email,
          user.name ?? "Cliente",
          order.orderNumber,
          total,
          items.map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.price }))
        ).catch(() => {});
      }
    }

    return NextResponse.json({ orderNumber: order.orderNumber, orderId: order.id, success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear el pedido" }, { status: 500 });
  }
}
