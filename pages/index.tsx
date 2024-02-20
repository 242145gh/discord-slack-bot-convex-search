import algoliasearch from 'algoliasearch/lite';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import singletonRouter from 'next/router';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {  DynamicWidgets,  InstantSearch,  Hits,  Highlight,  RefinementList,  SearchBox,  InstantSearchServerState,  InstantSearchSSRProvider,  getServerState } from 'react-instantsearch';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "../@/components/ui/avatar"
import { Panel } from '../components/Panel';
const client = algoliasearch('5JJ918ZR72', '3386d55e39a56cac0e99ffb161b8c1a2');
import '../styles/globals.css';
import 'instantsearch.css/themes/satellite-min.css';


type Message = {
  author: {
    avatar: string;
    convexer: boolean;
    name: string;
  };
  body: string;
};


type HitProps = {
  hit: AlgoliaHit<{
    title: string;
    objectID: string;
    date: number;
    messages: Message[];
  }>;
};


function Hit({ hit }: HitProps) {
  console.log(hit.messages);
  return (
    <>
    <Avatar>
      <Highlight className="h-22" hit={hit} attribute="objectID" />
      <a href={`https://discord.com/channels/1206282035904385124/1208419816881266698/threads/${hit.objectID}`}>
        <div className="text-xs text-slate-700 font-bold">{hit.title}</div>
        <div className="grid grid-cols-1 gap-1 text-slate-500 bg-slate-200 p-1 rounded text-xs"> {/* Define a grid with 2 columns */}
          {hit.messages
            .slice(1, 23) // Limiting to first 3 messages
            .sort((a, b) => hit.date - hit.date) // Sorting by date
            .map((message, index) => (
              <div key={index} className="flex items-center"> {/* Each message in a row */}
                <AvatarImage src={message.author.avatar} alt={''} width={20} height={20} className='rounded-full mr-2' />
                <div>{hit.date}</div>
                <div>{message.body}</div>
              </div>
            ))}
        </div>
      </a></Avatar>
    </>
    
  );
}

type HomePageProps = {
  serverState?: InstantSearchServerState;
  url?: string;
};

export default function HomePage({ serverState, url }: HomePageProps) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <Head>
        <title>React InstantSearch - Next.js</title>
      </Head>

      <InstantSearch
        searchClient={client}
        indexName="discord"
        routing={{
          router: createInstantSearchRouterNext({
            serverUrl: url,
            singletonRouter,
            routerOptions: {
              cleanUrlOnDispose: false,
            },
          }),
        }}
        insights={false}
      >
        <div className="Container">
          <div>
            <DynamicWidgets fallbackComponent={FallbackComponent} />
          </div>
          <div>
            <SearchBox className='w-220 mt-10 ml-10 w-1/3'/>
            <Hits hitComponent={Hit} className='w-220 ml-10 w-1/3'/>
          </div>
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

function FallbackComponent({ attribute }: { attribute: string }) {
  return (
    <Panel header={attribute}>
      <RefinementList attribute={attribute} />
    </Panel>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> =
  async function getServerSideProps({ req }) {
    const protocol = req.headers.referer?.split('://')[0] || 'https';
    const url = `${protocol}://${req.headers.host}${req.url}`;
    const serverState = await getServerState(<HomePage url={url} />, {
      renderToString,
    });

    return {
      props: {
        serverState,
        url,
      },
    };
  };
