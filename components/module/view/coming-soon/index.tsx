import ImageDynamic from "@/components/ui/dynamic-image"
import terms from "@/content/general/terms.json"

export default function ViewComingSoon() {
	return (
        <div
            className={`w-fit grid m-auto p-4`}
        >
            <ImageDynamic
                title={`Fractionax - Coming Soon`}
                className={`grid w-[75vw] max-w-[600px] mx-auto`}
                light={"/brand/assets/lettermark/dark.svg"}
                dark={"/brand/assets/lettermark/light.svg"}
                width={1920}
                height={1920}
                useWindowWidth={false}
                useWindowHeight={false}
            />
            <div
                className={`mt-8 mb-4 border border-primary`}
            />
            <h2
                className={`grid text-primary text-[calc(36px+(90)*((100vw-324px)/(1980-324)))] text-center mx-auto leading font-bold`}
            >
                {`${terms.coming_soon}`}
            </h2>
        </div>
	)
}