import { ImagePlus, Loader2, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/components/alert'
import Image from '#/components/image'
import { usePlantDoctor } from '#/modules/plants/hooks/plant-doctor.hook'

const PlantDoctor = () => {
  const { fileId, image, result, error, isAnalyzing, handleImageChange, uploadHint, StatusIcon, statusTitle } =
    usePlantDoctor()

  return (
    <div className="space-y-4">
      <label
        htmlFor={fileId}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed p-4 text-sm text-muted-foreground hover:bg-accent"
      >
        {image && <Image src={image} alt="عکس گیاه برای تشخیص" className="max-h-56 rounded-lg object-contain" />}
        {!image && <ImagePlus aria-hidden />}
        {uploadHint}
      </label>
      <input
        id={fileId}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={isAnalyzing}
        onChange={handleImageChange}
      />

      {isAnalyzing && (
        <p role="status" className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden /> در حال بررسی سلامت گیاه…
        </p>
      )}
      {error && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {result && (
        <div className="space-y-3" aria-live="polite">
          <Alert>
            <StatusIcon />
            <AlertTitle>{statusTitle}</AlertTitle>
            {result.summary && <AlertDescription>{result.summary}</AlertDescription>}
          </Alert>
          {result.problems.map((p) => (
            <div key={p.title} className="space-y-1 rounded-xl border p-3 text-sm">
              <p className="font-semibold">{p.title}</p>
              {p.cause && <p className="text-muted-foreground">علت: {p.cause}</p>}
              {p.fix && <p className="whitespace-pre-line">درمان: {p.fix}</p>}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">تشخیص هوش مصنوعی ممکن است خطا داشته باشد.</p>
        </div>
      )}
    </div>
  )
}

export { PlantDoctor }
