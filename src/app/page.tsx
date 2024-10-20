"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import QrCode from "qrcode"

import Image from "next/image"
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"


const formSchema = z.object({
  url: z.string().url(),
});

const SIZE = 500;


export default function Home() {
  const imageRef = useRef(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: ''
    }
  });

  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const onSubmit = async (values: z.infer<typeof formSchema>): Promise<void> => {
    const { url } = values;
    const qrCodeDataurl = await QrCode.toDataURL(url, {
      width: SIZE
    });
    setQrCodeData(qrCodeDataurl);
  };

  const handleCopyImage = () => {
    if (!!imageRef.current) {
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(imageRef.current, 0, 0, SIZE, SIZE);

        canvas.toBlob((blob) => {
          if (blob) {
            console.log(blob);
            navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
          }
        }, 'image/png');
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <Form {...form}>
        <form
          className={cn("w-1/2 flex gap-3")}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField name='url' control={form.control} render={({ field }) => (
            <FormItem className={cn("flex-1")}>
              <Input {...field} placeholder='Enter URL' type='url' />
              <FormMessage />
            </FormItem>

          )} />

          <Button type="submit" className={cn("bg-green-600")}>
            Generate QrCode
          </Button>
        </form>
      </Form>

      {qrCodeData && (
        <>
          <Image
            ref={imageRef}
            src={qrCodeData}
            alt="Generated QR Code"
            width={SIZE}
            height={SIZE}
          />
          <div className={cn('flex gap-5')}>
            <a href={qrCodeData} download className={cn('bg-sky-500 px-4 py-2 rounded text-white')}>
              Download QrCode
            </a>

            <Button onClick={handleCopyImage} className={cn('bg-green-600 py-3 px-4 rounded text-white')}>
              Copy Image
            </Button>
          </div>
        </>
      )}

    </main>
  );
}
