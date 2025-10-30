
// FIX: Define placeholder variables for missing image assets to resolve "Cannot find name" errors.
const imgImage = "https://placehold.co/132x118";
const imgImage1 = "https://placehold.co/146x129";
const imgImage2 = "https://placehold.co/46x12";
const imgImage3 = "https://placehold.co/42x12";
const imgImage4 = "https://placehold.co/51x12";
const imgImage5 = "https://placehold.co/50x12";
const imgImage6 = "https://placehold.co/57x13";
const imgImage7 = "https://placehold.co/74x75";
const imgImage8 = "https://placehold.co/77x73";
const imgImage9 = "https://placehold.co/76x75";
const imgImage10 = "https://placehold.co/89x89";
const imgImage11 = "https://placehold.co/50x50";
const imgImage12 = "https://placehold.co/131x118";
const imgImage13 = "https://placehold.co/111x120";
const imgBackground = "https://placehold.co/91x45";
const imgImage14 = "https://placehold.co/123x119";
const imgImage15 = "https://placehold.co/146x155";
const imgImage16 = "https://placehold.co/20x44";
const imgImage17 = "https://placehold.co/491x128";
const imgImage18 = "https://placehold.co/25x35";
const imgImage19 = "https://placehold.co/1023x1024";

function Groups() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-[13px] h-[205px] right-[132px] w-[674px]" data-name="Groups">
      <div className="absolute bg-[#9fdcc4] bottom-px h-[202px] right-[3px] rounded-[37px] w-[668px]" data-name="Background">
        <div aria-hidden="true" className="absolute border border-[#b1d7c2] border-solid inset-0 pointer-events-none rounded-[37px]" />
      </div>
      <div className="absolute bottom-[22px] h-[118px] right-[31px] w-[132px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute bottom-[116px] flex flex-col font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[52px] justify-center leading-[0] not-italic right-[457px] text-[#f3faf7] text-[35.5px] translate-x-[100%] translate-y-[50%] w-[272px]">
        <p className="leading-[normal]">Timeline Tango</p>
      </div>
      <div className="absolute bottom-[39px] h-[129px] right-[503px] w-[146px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
    </div>
  );
}

function Groups1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-[151px] h-[228px] right-0 w-[957px]" data-name="Groups">
      <Groups />
    </div>
  );
}

function Groups2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-px h-[379px] right-[43px] w-[957px]" data-name="Groups">
      <div className="absolute bg-[#fcfdfd] bottom-0 h-[146px] right-[46px] rounded-bl-[62px] rounded-br-[60px] rounded-tl-[73px] rounded-tr-[73px] w-[845px]" data-name="Background">
        <div aria-hidden="true" className="absolute border border-[#f9faf6] border-solid inset-0 pointer-events-none rounded-bl-[62px] rounded-br-[60px] rounded-tl-[73px] rounded-tr-[73px]" />
      </div>
      <div className="absolute bottom-[147px] h-[12px] right-[276px] w-[46px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
      <div className="absolute bottom-[147px] h-[12px] right-[360px] w-[42px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage3} />
      </div>
      <div className="absolute bottom-[147px] h-[12px] right-[439px] w-[51px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage4} />
      </div>
      <div className="absolute bottom-[147px] h-[12px] right-[527px] w-[50px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage5} />
      </div>
      <div className="absolute bottom-[146px] h-[13px] right-[698px] w-[57px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage6} />
      </div>
      <Groups1 />
    </div>
  );
}

function Groups3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-0 h-[129px] right-0 w-[136px]" data-name="Groups">
      <div className="absolute bottom-[26px] flex flex-col font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[22px] justify-center leading-[0] not-italic right-[95px] text-[#f2d897] text-[21.1px] translate-x-[100%] translate-y-[50%] w-[70px]">
        <p className="leading-[normal]">Profile</p>
      </div>
      <div className="absolute bottom-[43px] h-[75px] right-[25px] rounded-[37.25px] w-[74px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[37.25px] size-full" src={imgImage7} />
      </div>
    </div>
  );
}

function Groups4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-0 h-[128px] right-[137px] w-[149px]" data-name="Groups">
      <div className="absolute bottom-[24px] flex flex-col font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[26px] justify-center leading-[0] not-italic right-[125px] text-[#95d1bd] text-[19.8px] translate-x-[100%] translate-y-[50%] w-[108px]">
        <p className="leading-[normal]">Scrapbook</p>
      </div>
      <div className="absolute bottom-[43px] h-[73px] right-[33px] rounded-[37.75px] w-[77px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[37.75px] size-full" src={imgImage8} />
      </div>
    </div>
  );
}

function Groups5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-0 h-[139px] right-[280px] w-[147px]" data-name="Groups">
      <div className="absolute bottom-[25px] flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[22px] justify-center leading-[0] not-italic right-[110px] text-[#af9fe6] text-[19.5px] translate-x-[100%] translate-y-[50%] w-[69px]">
        <p className="leading-[normal]">Games</p>
      </div>
      <div className="absolute bottom-[43px] h-[75px] right-[37px] rounded-[37.75px] w-[76px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[37.75px] size-full" src={imgImage9} />
      </div>
    </div>
  );
}

function Groups6() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-px h-[139px] right-[209px] w-[662px]" data-name="Groups">
      <Groups3 />
      <Groups4 />
      <Groups5 />
      <div className="absolute bottom-[78px] flex flex-col font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[30px] justify-center leading-[0] not-italic right-[551px] text-[#403f3f] text-[29px] translate-x-[100%] translate-y-[50%] w-[86px]">
        <p className="leading-[normal]">Home</p>
      </div>
      <div className="absolute bottom-[32px] right-[573px] rounded-[44.5px] size-[89px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[44.5px] size-full" src={imgImage10} />
      </div>
    </div>
  );
}

function Groups7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-0 h-[147px] right-[14px] w-[948px]" data-name="Groups">
      <div className="absolute bottom-[31px] right-[17px] size-[50px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage11} />
      </div>
      <Groups6 />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-0 h-[218px] right-0 w-[684px]" data-name="Button">
      <div className="absolute bg-[#86b6e8] bottom-[5px] h-[206px] right-[8px] rounded-[39px] w-[668px]" data-name="Background">
        <div aria-hidden="true" className="absolute border border-[#90bbe4] border-solid inset-0 pointer-events-none rounded-[39px]" />
      </div>
      <div className="absolute bottom-[26px] h-[118px] right-[34px] w-[131px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage12} />
      </div>
      <div className="absolute bottom-[111.5px] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[97px] justify-center leading-[47.003px] not-italic right-[463px] text-[#eff5fa] text-[38.3px] translate-x-[100%] translate-y-[50%] w-[191px]">
        <p className="mb-0">Story Quiz</p>
        <p>Quest</p>
      </div>
      <div className="absolute bottom-[60px] h-[120px] right-[515px] w-[111px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage13} />
      </div>
    </div>
  );
}

function Groups8() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-[388px] h-[218px] right-[170px] w-[684px]" data-name="Groups">
      <Button />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-[147px] h-[51px] right-[17px] w-[98px]" data-name="Button">
      <div className="absolute bottom-[3px] h-[45px] right-[3px] w-[91px]" data-name="Background">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgBackground} />
      </div>
      <div className="absolute bottom-[25.5px] flex flex-col font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[29px] justify-center leading-[0] not-italic right-[79px] text-[#f38a74] text-[24.6px] translate-x-[100%] translate-y-[50%] w-[64px]">
        <p className="leading-[normal]">New!</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-[-3px] h-[210px] right-[94px] w-[685px]" data-name="Button">
      <div className="absolute bg-[#b58eee] bottom-[3px] h-[205px] right-[8px] rounded-[39px] w-[668px]" data-name="Background">
        <div aria-hidden="true" className="absolute border border-[#b192ea] border-solid inset-0 pointer-events-none rounded-[39px]" />
      </div>
      <div className="absolute bottom-[22px] h-[119px] right-[33px] w-[123px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage14} />
      </div>
      <Button1 />
      <div className="absolute bottom-[107.5px] flex flex-col font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[97px] justify-center leading-[46.459px] not-italic right-[461px] text-[#f4f0fa] text-[36.8px] translate-x-[100%] translate-y-[50%] w-[186px]">
        <p className="mb-0">Memory</p>
        <p>Match-Up</p>
      </div>
      <div className="absolute bottom-[28px] h-[155px] right-[503px] w-[146px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage15} />
      </div>
    </div>
  );
}

function Groups9() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-[624px] h-[216px] right-[76px] w-[947px]" data-name="Groups">
      <Button2 />
    </div>
  );
}

function Groups10() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] bottom-[858px] h-[132px] right-[45px] w-[928px]" data-name="Groups">
      <div className="absolute bottom-[77px] h-[44px] right-[195px] w-[20px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage16} />
      </div>
      <div className="absolute bottom-[3px] h-[128px] right-[215px] w-[491px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage17} />
      </div>
      <div className="absolute bottom-[66.5px] flex flex-col font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[67px] justify-center leading-[0] not-italic right-[669px] text-[#393838] text-[62.7px] translate-x-[100%] translate-y-[50%] w-[424px]">
        <p className="leading-[normal]">{`Fun & Games!`}</p>
      </div>
      <div className="absolute bottom-[18px] h-[35px] right-[705px] w-[25px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage18} />
      </div>
    </div>
  );
}

function Root() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[1024px] left-0 right-0 top-0" data-name="Root">
      <div className="absolute bottom-0 h-[1024px] right-0 w-[1023px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage19} />
      </div>
      <Groups2 />
      <Groups7 />
      <Groups8 />
      <Groups9 />
      <Groups10 />
    </div>
  );
}

export default function Group() {
  return (
    <div className="relative size-full">
      <Root />
    </div>
  );
}
