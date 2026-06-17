import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Define Deno serve handler
Deno.serve(async (req: Request) => {
  // Allow CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      }
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    const payload = await req.json();

    // Initialize Supabase Client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Log the webhook payload
    await supabase.from("webhook_logs").insert({ payload });

    // 2. Process payment (only process paid events, e.g. "pix.paid" or general payment events)
    // We should be lenient: if status is "paid", or event includes ".paid", process it.
    const isPaid = payload.payment?.status === "paid" || String(payload.event).endsWith(".paid");
    if (!isPaid) {
      return new Response(JSON.stringify({ message: "Webhook logged, but not a paid event. No action taken." }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const customer = payload.customer;
    if (!customer || !customer.email) {
      return new Response(JSON.stringify({ error: "Missing customer email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const customerEmail = customer.email.toLowerCase().trim();
    const customerName = customer.name || customerEmail.split("@")[0];

    // Determine plan ( Básico vs Completo )
    // If product title contains "COMPLETO" -> completo. If BÁSICO -> basico.
    const mainProductTitle = payload.product?.title || "";
    let plano = "basico";
    if (mainProductTitle.toUpperCase().includes("COMPLETO")) {
      plano = "completo";
    }

    // Process orderbumps
    const products = payload.products || [];
    const orderbumps: string[] = [];
    for (const prod of products) {
      if (prod.type === "orderbump") {
        orderbumps.push(prod.title || prod.id);
      }
    }

    // Fetch existing aluno to merge orderbumps if they already exist
    const { data: existingAluno } = await supabase
      .from("alunos")
      .select("orderbumps")
      .eq("email", customerEmail)
      .maybeSingle();

    let finalOrderbumps = orderbumps;
    if (existingAluno && existingAluno.orderbumps) {
      const currentBumps = Array.isArray(existingAluno.orderbumps) ? existingAluno.orderbumps : [];
      finalOrderbumps = [...new Set([...currentBumps, ...orderbumps])];
    }

    // Create or update student in database
    const { error: upsertError } = await supabase
      .from("alunos")
      .upsert({
        email: customerEmail,
        nome: customerName,
        plano: plano,
        orderbumps: finalOrderbumps
      });

    if (upsertError) {
      console.error("Database upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Send email via Resend
    const resendToken = "re_eNU1xVhC_2Er4BAQwr5s5jBcDPMYBMsjp";
    const emailHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acesso Liberado</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
            color: #1b3a30;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(15, 61, 46, 0.05);
            border: 1px solid #e2e8e5;
        }
        .header {
            background-color: #0f3d2e;
            padding: 40px 20px;
            text-align: center;
            border-bottom: 4px solid #7ed957;
        }
        .header img {
            height: 80px;
            margin-bottom: 15px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
        }
        .content h2 {
            font-size: 20px;
            color: #0f3d2e;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .info-box {
            background-color: #f0f7f4;
            border-left: 4px solid #7ed957;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .info-box p {
            margin: 0 0 10px 0;
            font-size: 14px;
        }
        .info-box p:last-child {
            margin: 0;
        }
        .email-highlight {
            font-size: 18px;
            font-weight: 700;
            color: #0f3d2e;
            background-color: #ffffff;
            padding: 6px 12px;
            border-radius: 4px;
            display: inline-block;
            border: 1px solid #e2e8e5;
            margin-top: 5px;
        }
        .btn-container {
            text-align: center;
            margin: 35px 0;
        }
        .btn {
            background-color: #0f3d2e;
            color: #ffffff !important;
            padding: 16px 32px;
            font-size: 16px;
            font-weight: 700;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 5px 15px rgba(15, 61, 46, 0.15);
        }
        .footer {
            background-color: #fafcfb;
            padding: 25px;
            text-align: center;
            font-size: 12px;
            color: #537568;
            border-top: 1px solid #e2e8e5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
            <h1>Área de Membros</h1>
        </div>
        <div class="content">
            <h2>Olá, ${customerName}!</h2>
            <p>Parabéns pela sua aquisição! Seu pagamento foi confirmado e seu acesso ao treinamento <strong>+350 Técnicas Ilustradas de Tanatopraxia</strong> já está liberado.</p>
            
            <div class="info-box">
                <p><strong>⚠️ ATENÇÃO - INFORMAÇÃO IMPORTANTE:</strong></p>
                <p>O seu acesso é feito <strong>exclusivamente</strong> utilizando o e-mail de compra informado por você no momento do pagamento.</p>
                <p>Seu e-mail de acesso cadastrado é:</p>
                <div class="email-highlight">${customerEmail}</div>
            </div>

            <p>Clique no botão abaixo para ir diretamente para a Área de Membros e começar seus estudos agora mesmo:</p>
            
            <div class="btn-container">
                <a href="https://350tecnicastanatopraxia.hyzencompra.shop/area-de-membros" class="btn" target="_blank">Acessar Área de Membros</a>
            </div>

            <p style="font-size: 13px; color: #537568; margin-top: 30px; border-top: 1px dashed #e2e8e5; padding-top: 20px;">
                Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:<br>
                <a href="https://350tecnicastanatopraxia.hyzencompra.shop/area-de-membros" style="color: #0f3d2e; word-break: break-all;">https://350tecnicastanatopraxia.hyzencompra.shop/area-de-membros</a>
            </p>

            <p>Bons estudos!</p>
            <p>Se precisar de suporte, basta responder a este e-mail.</p>
        </div>
        <div class="footer">
            <p>Este é um e-mail automático enviado pós-compra.<br>
            © 2026 +350 Técnicas de Tanatopraxia. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendToken}`
      },
      body: JSON.stringify({
        from: "Tanatopraxia Oficial <suporte@350tecnicastanatopraxia.hyzencompra.shop>",
        to: customerEmail,
        subject: "Acesso Liberado: +350 Técnicas Ilustradas de Tanatopraxia",
        html: emailHtml
      })
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error("Resend send email error:", resendError);
    }

    return new Response(JSON.stringify({ success: true, plano: plano, orderbumps: finalOrderbumps }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    console.error("Webhook exception:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
