# Contracts

This is a peek how it would look in TS, but any async system will do

```ts
type Chunk = {
 content: string;
 type: 'HTML' | 'hash' | 'criticalCSS' | 'internalCSS'
}

type PrepareChunksCb = (rawHTML: string)=>Array<Chunk>

type CandidatesResponse<Candidate extends string> = Promise<Array<Candidate>>;
/**
 * Clean the already solved candidates
 **/
type ResolveCandidatesCb<Candidate extends string> = function (
  candidates: Array<Candidate>, 
  alreadySolvedCandidates: Array<Candidate>
):Array<Candidate>

type GenerateCSSFromCandidatesCb<Candidate extends string> = function(
  candidates: Array<Candidate>
): Promise<string>

type GetImportantDataFromTemplate =  function(templateData: string):{
  criticalCandidates: Promise<Array<string>>;
  htmlContent: Map<string, Promise<string>> 
}

async function getNonBlockingCriticalCSSCandidates(
  candidatesPromise: Promise<Array<string>>,
  candidatesNonBlokingPromise: Promise<Array<string>>,
  mergeCb: ResolveCandidatesCb
){
  const candidates = await candidatesPromise;
  const candidatesNonBlokcing = await candidatesNonBlokingPromise;
  
  const mergedResult = merge(candidatesNonBlokcing, candidates)
}

async function *createHTML(
  chunks: Array<Chunk>, 
  htmlContent: Map<string, Promise<string>>,
  criticalCSS: Promise<string>,
  internalCSS: Promise<string>
){
  for(const chunk of chunks){
    switch (chunk.type){
      case 'HTML':
        yield chunk.content
      case 'hash':
        yield await htmlContent.get(chunk.content) ?? '';
      case 'criticalCSS':
        yield await criticalCSS;
      case 'internalCSS':
        yield await internalCSS;
      default:
        yield ''
    }

  }
}

const [aboveTheFoldData, belowtheFoldData] = await Promise.all(templatePaths.map(async (templatePath)=>{
  const template = await readFile(templatePath)  
  return getImportantDataFromTemplate(template)
}))



```
