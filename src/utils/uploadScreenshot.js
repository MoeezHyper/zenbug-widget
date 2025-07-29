import { supabase } from "../components/supabaseClient";

export const uploadScreenshot = async (base64DataUrl) => {
  const fileName = `screenshot-${Date.now()}.png`;
  const res = await fetch(base64DataUrl);
  const blob = await res.blob();

  const { data, error } = await supabase.storage
    .from("screenshots")
    .upload(fileName, blob, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("screenshots").getPublicUrl(fileName);

  return publicUrl;
};
